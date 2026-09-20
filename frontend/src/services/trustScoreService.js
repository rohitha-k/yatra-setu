export const calculateTrustScore = (vendor) => {
  // Breakdown coefficients (Section 12)
  let docPoints = vendor.verificationStatus === 'VERIFIED' ? 30 : (vendor.verificationStatus === 'UNDER_REVIEW' ? 15 : 5);
  let videoPoints = vendor.walkthroughVideoUrl ? 20 : 0;
  let reviewPoints = Math.round((vendor.rating || 4.2) * 6); // Max 30 points
  let consistencyPoints = vendor.priceConsistency || 10;
  let complaintPoints = vendor.hasComplaints ? 2 : 10;

  const total = docPoints + videoPoints + reviewPoints + consistencyPoints + complaintPoints;
  const score = Math.max(10, Math.min(100, total));

  const explanations = [];
  if (docPoints >= 30) explanations.push("✓ Business credentials verified");
  if (videoPoints >= 20) explanations.push("✓ Recent property verification video audited");
  if (reviewPoints >= 20) explanations.push("✓ Strong customer ratings");
  if (complaintPoints >= 10) explanations.push("✓ Low complaint rate");

  return {
    score,
    breakdown: {
      documentCheck: docPoints,
      videoCheck: videoPoints,
      reviewsCheck: reviewPoints,
      priceConsistency: consistencyPoints,
      complaintsCheck: complaintPoints
    },
    explanations
  };
};
