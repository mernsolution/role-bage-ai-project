
import cron from "node-cron";
import AuthModelData from "../schemaModel/AuthSchemaModel.js";

const deactivateInactiveUsers = async () => {
  try {
    console.log("🔄 Starting user deactivation check...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await AuthModelData.updateMany(
      {
        lastLogin: { $lt: thirtyDaysAgo },
        status: "Active"
      },
      {
        $set: { status: "Deactivated" }
      }
    );
    console.log(`✅ Deactivated ${result.modifiedCount} users who were inactive for 30+ days`);
    
    // Optional: Log the deactivated users for audit purposes
    if (result.modifiedCount > 0) {
      const deactivatedUsers = await AuthModelData.find({
        lastLogin: { $lt: thirtyDaysAgo },
        status: "Deactivated"
      }).select("userName email lastLogin");
      
      console.log("📋 Deactivated users:");
      deactivatedUsers.forEach(user => {
        console.log(`- ${user.userName} (${user.email}) - Last login: ${user.lastLogin}`);
      });
    }

    return {
      success: true,
      deactivatedCount: result.modifiedCount,
      message: `Successfully deactivated ${result.modifiedCount} inactive users`
    };

  } catch (error) {
    console.error("❌ Error deactivating inactive users:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize cron jobs
const initializeCronJobs = () => {
  // Run daily at 2:00 AM Bangladesh time
  cron.schedule("0 2 * * *", () => {
    console.log("🕐 Running scheduled user deactivation check...");
    deactivateInactiveUsers();
  }, {
    scheduled: true,
    timezone: "Asia/Dhaka"
  });

  // Optional: Run every Sunday at 10:00 AM for weekly check
  cron.schedule("0 10 * * 0", () => {
    console.log("🕐 Running weekly user deactivation check...");
    deactivateInactiveUsers();
  }, {
    scheduled: true,
    timezone: "Asia/Dhaka"
  });

  console.log("🚀 Cron jobs initialized:");
  console.log("- Daily user deactivation: 2:00 AM");
  console.log("- Weekly user deactivation: Sunday 10:00 AM");
};

export { initializeCronJobs };