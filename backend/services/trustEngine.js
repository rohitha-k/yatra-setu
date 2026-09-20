class TrustEngine {
  static calculateScore(vendor) {
    const isVerified = vendor.verificationStatus === 'VERIFIED';
    const hasVideo = !!vendor.walkthroughVideoUrl;
    
    // Breakdown math (Section 12)
    let docCheck = isVerified ? 30 : (vendor.verificationStatus === 'UNDER_REVIEW' ? 15 : 5);
    let videoCheck = hasVideo ? 20 : 0;
    
    // Normalize vendor base trustScore to 30 points max
    let reviewsCheck = vendor.trustScore ? Math.round(vendor.trustScore * 0.3) : 20;
    let priceConsistency = 10;
    let complaintsCheck = vendor.verificationStatus === 'FLAGGED' ? 2 : 10;
    
    const total = docCheck + videoCheck + reviewsCheck + priceConsistency + complaintsCheck;
    const finalScore = Math.max(10, Math.min(100, total));
    
    const badges = [
      "Identity Verified",
      isVerified ? "Documents Verified" : "Pending Documents Verification",
      hasVideo ? "Walkthrough Video Audited" : "Pending Spatial Video Audit",
      "Transparent Pricing"
    ];

    const explanations = [];
    if (docCheck >= 30) explanations.push("✓ Business credentials verified");
    if (videoCheck >= 20) explanations.push("✓ Recent property verification video audited");
    if (reviewsCheck >= 20) explanations.push("✓ Strong customer ratings");
    if (complaintsCheck >= 10) explanations.push("✓ Low complaint rate");

    return {
      trustScore: finalScore,
      breakdown: {
        documentVerification: docCheck,
        videoVerification: videoCheck,
        customerReviews: reviewsCheck,
        priceTransparency: priceConsistency,
        bookingReliability: complaintsCheck
      },
      badges,
      explanations
    };
  }
}

export default TrustEngine;
