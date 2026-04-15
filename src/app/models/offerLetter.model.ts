

export type OfferLetterStatus = "pending" | "accepted" | "rejected" | "verified";

export interface Compensation {
    baseSalary: number;
    currency: string;
    period: "monthly" | "yearly";
    bonus?: string;
    otherBenefits?: string;
}

export interface SignedDocument {
    fileKey: string;
    fileName: string;
    uploadedAt: string;
    signedURL?: string;
}

export interface OfferLetter {
    _id: string;
    application: { _id: string; status: string };
    job: { _id: string; title: string; slug: string };
    company: {
        _id: string;
        name: string;
        email: string;
        location?: string;
        profilePicture?: { location: string };
    };
    candidate: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        profilePicture?: { location: string };
    };
    offerDate: string;
    expiresAt: string;
    designation: string;
    department: string;
    joiningDate: string;
    workLocation: string;
    workMode: string;
    employmentType: string;
    compensation: Compensation;
    probationPeriod?: number;
    additionalTerms?: string;
    status: OfferLetterStatus;
    respondedAt?: string;
    rejectionReason?: string;
    signedDocument?: SignedDocument;
    verifiedAt?: string;
    generatedPdfSignedURL?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOfferDto {
    applicationId: string;
    designation: string;
    department: string;
    joiningDate: string;
    expiresAt: string;
    workLocation: string;
    workMode: "onsite" | "remote" | "hybrid";
    employmentType: "full-time" | "part-time" | "contract" | "internship";
    compensation: Compensation;
    probationPeriod?: number;
    additionalTerms?: string;
}

export interface RespondDto {
    action: "accept" | "reject";
    rejectionReason?: string;
}



