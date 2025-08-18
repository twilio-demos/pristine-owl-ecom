console.log("🧪 Testing analytics..."); 
if (typeof analytics !== "undefined") {
  console.log("✅ Analytics available");
  analytics.track("Page Load Test", {source: "direct_test"});
  console.log("✅ Track event sent");
} else {
  console.log("❌ Analytics not available");
}
