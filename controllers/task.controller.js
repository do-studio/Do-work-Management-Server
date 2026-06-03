import MonthlyTaskModel from "../models/monthlyTask.model.js";
import UserModel from "../models/user.js";
import configKeys from "../config/configKeys.js";

const taskController = {
  /**
   * Fetch all employees and their monthly tasks aggregated for a specific month
   * GET /api/tasks/monthly-dashboard?month=YYYY-MM
   */
  getMonthlyDashboard: async (req, res) => {
    try {
      const { month } = req.query;

      if (!month) {
        return res.status(400).json({
          status: false,
          message: "Month query parameter is required (format: YYYY-MM)."
        });
      }

      // Fetch users with employee roles who have the 'content-page' permission
      const employees = await UserModel.find(
        {
          role: { $in: ["employee", configKeys.JWT_USER_ROLE || "roleUser"] },
          "permissions.allowedPermissions": "content-page"
        },
        { userName: 1, email: 1, role: 1, profilePhotoURL: 1 }
      ).sort({ userName: 1 });

      // Fetch all MonthlyTask entries matching the month and populate clientId and assignedTo
      const tasks = await MonthlyTaskModel.find({ monthYear: month })
        .populate("clientId")
        .populate("assignedTo", "userName profilePhotoURL");

      // Group tasks by creator (employeeId)
      const tasksByEmployee = {};
      tasks.forEach((task) => {
        const creatorId = task.employeeId?.toString();
        if (!creatorId) return;

        const taskObj = {
          _id: task._id,
          employeeId: task.employeeId,
          clientId: task.clientId,
          assignedTo: task.assignedTo || [],
          strategy: task.strategy || { status: "Not Started", dueDate: null },
          script: task.script || { status: "Not Started", dueDate: null },
          motion: task.motion || { status: "Not Started", dueDate: null },
          poster: task.poster || { status: "Not Started", dueDate: null }
        };

        if (!tasksByEmployee[creatorId]) {
          tasksByEmployee[creatorId] = [];
        }
        tasksByEmployee[creatorId].push(taskObj);
      });

      // Construct final aggregated response ensuring all employees are listed
      // Even if they have no tasks recorded for the month, they are included with tasks: []
      const aggregatedData = employees.map((emp) => ({
        employeeId: emp._id,
        employeeName: emp.userName,
        profilePhotoURL: emp.profilePhotoURL,
        tasks: tasksByEmployee[emp._id.toString()] || []
      }));

      return res.status(200).json({
        status: true,
        data: aggregatedData
      });
    } catch (error) {
      console.error("Error in getMonthlyDashboard:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Internal server error while fetching monthly dashboard."
      });
    }
  },

  /**
   * Save or update a monthly task tracking row (upsert mechanism)
   * POST /api/tasks/save
   */
  saveMonthlyTask: async (req, res) => {
    try {
      const {
        employeeId,
        clientId,
        monthYear,
        strategy,
        script,
        motion,
        poster,
        assignedTo
      } = req.body;

      if (!employeeId || !clientId || !monthYear) {
        return res.status(400).json({
          status: false,
          message: "employeeId, clientId, and monthYear are required fields."
        });
      }

      // Build the update payload only with fields provided in the body
      const updateData = {};
      if (strategy !== undefined) updateData.strategy = strategy;
      if (script !== undefined) updateData.script = script;
      if (motion !== undefined) updateData.motion = motion;
      if (poster !== undefined) updateData.poster = poster;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

      const task = await MonthlyTaskModel.findOneAndUpdate(
        { employeeId, clientId, monthYear },
        {
          $set: updateData
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      return res.status(200).json({
        status: true,
        message: "Monthly task saved successfully.",
        data: task
      });
    } catch (error) {
      console.error("Error in saveMonthlyTask:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Internal server error while saving monthly task."
      });
    }
  },

  /**
   * Delete a monthly task tracking row
   * DELETE /api/tasks/delete?employeeId=...&clientId=...&monthYear=...
   */
  deleteMonthlyTask: async (req, res) => {
    try {
      const { employeeId, clientId, monthYear } = req.query;

      if (!employeeId || !clientId || !monthYear) {
        return res.status(400).json({
          status: false,
          message: "employeeId, clientId, and monthYear are required query parameters."
        });
      }

      const result = await MonthlyTaskModel.findOneAndDelete({ employeeId, clientId, monthYear });

      if (result) {
        return res.status(200).json({
          status: true,
          message: "Monthly task deleted successfully."
        });
      } else {
        return res.status(404).json({
          status: false,
          message: "Monthly task not found in database."
        });
      }
    } catch (error) {
      console.error("Error in deleteMonthlyTask:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Internal server error while deleting monthly task."
      });
    }
  }
};

export default taskController;
