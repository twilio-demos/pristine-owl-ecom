import { AnalyticsBrowser } from '@segment/analytics-next'

// Initialize Segment Analytics
export const analytics = AnalyticsBrowser.load({
  writeKey: 'gjA4ViwEJm6Vo4JNL0Gm122FvKKbO3Bp'
})

// Export analytics functions for easy use
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  return analytics.track(event, properties)
}

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  return analytics.identify(userId, traits)
}

export const pageView = (name?: string, properties?: Record<string, any>) => {
  return analytics.page(name, properties)
}

// Initialize page view on load
analytics.page()

export default analytics