# YatraSetu Trust & Verification System

This document outlines the workflow and calculations of the trust score and partner verification system.

---

## 1. Trust Score 0–100 Formula

The Trust Score is a transparent metric calculated out of 100 points:

$$\text{Trust Score} = \text{Docs (30)} + \text{Video (20)} + \text{Reviews (30)} + \text{Pricing (10)} + \text{Complaints (10)}$$

* **Identity Documents (30 pts)**: Verified GSTIN and business licenses.
* **Video Walkthrough Audit (20 pts)**: GPS-stamped walkthrough video uploaded by the vendor.
* **Customer Reviews (30 pts)**: Normalized based on ratings (Rating $\times$ 6).
* **Price Consistency (10 pts)**: Awarded for keeping listed rates stable.
* **Complaint History (10 pts)**: Deducts points if active unresolved disputes are registered.

---

## 2. Walkthrough Verification Pipeline

1. **Upload**: Vendors record and upload a walkthrough video of their properties.
2. **Review**: The government authority console logs the upload state as `UNDER_REVIEW`.
3. **Action**: The admin inspects the walkthrough and either approves (setting status to `VERIFIED`) or rejects it.
