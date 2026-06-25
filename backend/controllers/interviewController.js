import InterviewRequest from "../models/InterviewRequest.js";
import { randomUUID } from "crypto";
import { logger } from "../utils/logger.js";
import { validateInterviewRequest } from "../utils/validators.js";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper: Retry logic for operations
const retryOperation = async (operation, retries = MAX_RETRIES) => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error.code !== 11000) {
      logger.warn(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

export const requestLiveInterview = async (req, res) => {
  try {
    const { domain, experienceLevel, skills = [] } = req.body;
    const { _id: userId, name, email } = req.user;

    // Validate input
    const validationErrors = validateInterviewRequest(req.body);
    if (validationErrors.length > 0) {
      logger.warn(`Interview request validation failed: ${validationErrors.join(', ')}`);
      return res.status(400).json({ 
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Create interview request with retry logic
    const request = await retryOperation(async () => {
      return await InterviewRequest.create({
        userId,
        name,
        email,
        domain,
        experienceLevel,
        skills,
        status: "pending"
      });
    });

    logger.info(`Interview request created: ${request._id} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: "Interview request submitted for admin approval",
      request: {
        _id: request._id,
        status: request.status,
        domain: request.domain,
        createdAt: request.createdAt
      }
    });

  } catch (err) {
    logger.error(`Error creating interview request: ${err.message}`, err);
    res.status(500).json({ 
      success: false,
      message: "Failed to create interview request",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getMyLiveInterviewRequest = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const request = await InterviewRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    logger.debug(`Fetched interview requests for user ${userId}`);

    return res.status(200).json({
      success: true,
      request: request || null
    });
  } catch (err) {
    logger.error(`Error fetching interview request: ${err.message}`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch interview request",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getLiveInterviewRoomDetails = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const request = await InterviewRequest.findOne({ meetingId })
      .populate("userId", "name email resumeUrl resumeOriginalName resumeUploadedAt")
      .select("-__v");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Interview room not found",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const isCandidate = request.userId?._id?.toString() === req.user?._id?.toString();

    if (!isAdmin && !isCandidate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this interview room",
      });
    }

    return res.status(200).json({
      success: true,
      request,
      candidate: request.userId,
      resume: request.userId?.resumeUrl
        ? {
            url: request.userId.resumeUrl,
            originalName: request.userId.resumeOriginalName,
            uploadedAt: request.userId.resumeUploadedAt,
          }
        : null,
    });
  } catch (err) {
    logger.error(`Error fetching interview room details: ${err.message}`, err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview room details",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const approveLiveInterviewRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { scheduledAt } = req.body;

    const request = await InterviewRequest.findById(requestId).populate(
      "userId",
      "name email"
    );

    if (!request) {
      logger.warn(`Interview request not found: ${requestId}`);
      return res.status(404).json({ 
        success: false,
        message: "Interview request not found" 
      });
    }

    // Update request with approval details using updateOne to bypass full validation
    const meetingId = request.meetingId || randomUUID();
    const meetingLink = request.meetingLink || `/interview-room/${meetingId}`;

    await InterviewRequest.updateOne(
      { _id: requestId },
      {
        status: 'approved',
        meetingId,
        meetingLink,
        scheduledAt: scheduledAt || new Date(),
        scheduledBy: req.user._id,
      }
    );

    logger.info(`Interview request approved: ${requestId} by admin ${req.user._id}`);

    return res.status(200).json({
      success: true,
      message: 'Live interview request approved',
      request: {
        _id: request._id,
        status: 'approved',
        meetingId,
        meetingLink,
        scheduledAt: scheduledAt || new Date(),
        user: {
          id: request.userId?._id,
          name: request.userId?.name,
          email: request.userId?.email,
        },
      },
    });
  } catch (err) {
    logger.error(`Error approving interview request: ${err.message}`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to approve interview request",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const rejectLiveInterviewRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    const request = await InterviewRequest.findById(requestId);

    if (!request) {
      logger.warn(`Interview request not found for rejection: ${requestId}`);
      return res.status(404).json({ 
        success: false,
        message: "Interview request not found" 
      });
    }

    await InterviewRequest.updateOne(
      { _id: requestId },
      {
        status: 'rejected',
        rejectionReason: rejectionReason || 'Admin decision',
      }
    );

    logger.info(`Interview request rejected: ${requestId}`);

    return res.status(200).json({
      success: true,
      message: 'Interview request rejected',
      request: { _id: requestId, status: 'rejected', rejectionReason },
    });
  } catch (err) {
    logger.error(`Error rejecting interview request: ${err.message}`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to reject interview request"
    });
  }
};

export const rescheduleLiveInterview = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ 
        message: "scheduledAt is required" 
      });
    }

    const request = await InterviewRequest.findById(requestId);

    if (!request) {
      logger.warn(`Interview request not found for rescheduling: ${requestId}`);
      return res.status(404).json({ 
        success: false,
        message: "Interview request not found" 
      });
    }

    await InterviewRequest.updateOne(
      { _id: requestId },
      { scheduledAt: new Date(scheduledAt) }
    );

    logger.info(`Interview request rescheduled: ${requestId} to ${scheduledAt}`);

    return res.status(200).json({
      success: true,
      message: 'Interview rescheduled',
      request: { _id: requestId, scheduledAt },
    });
  } catch (err) {
    logger.error(`Error rescheduling interview: ${err.message}`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to reschedule interview"
    });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating, feedback } = req.body;

    const request = await InterviewRequest.findById(requestId);

    if (!request) {
      logger.warn(`Interview request not found for completion: ${requestId}`);
      return res.status(404).json({ 
        success: false,
        message: "Interview request not found" 
      });
    }

    await InterviewRequest.updateOne(
      { _id: requestId },
      {
        status: 'completed',
        completedAt: new Date(),
        rating,
        feedback,
      }
    );

    logger.info(`Interview completed: ${requestId}`);

    return res.status(200).json({
      success: true,
      message: 'Interview marked as completed',
      request: { _id: requestId, status: 'completed', rating, feedback },
    });
  } catch (err) {
    logger.error(`Error completing interview: ${err.message}`, err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to complete interview"
    });
  }
};
