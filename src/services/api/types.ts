// Base types for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Bill related types
export interface Bill {
  congress: number;
  number: string;
  type: string;
  title: string;
  originChamber: string;
  originChamberCode: string;
  introducedDate: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  sponsors: Sponsor[];
  cosponsors: {
    count: number;
    list: Cosponsor[];
  };
  committees: {
    count: number;
    list: Committee[];
  };
  actions: {
    count: number;
    list: Action[];
  };
  summaries: {
    count: number;
    list: Summary[];
  };
  subjects: {
    count: number;
    policyArea: {
      name: string;
    };
    legislativeSubjects: {
      name: string;
    }[];
  };
  textVersions: {
    count: number;
    list: TextVersion[];
  };
  titles: {
    count: number;
    list: Title[];
  };
  relatedBills: {
    count: number;
    list: RelatedBill[];
  };
  laws: Law[];
  cboCostEstimates: CboCostEstimate[];
  committeeReports: CommitteeReport[];
  constitutionalAuthorityStatementText: string;
  updateDate: string;
  updateDateIncludingText: string;
}

// Supporting types for Bill
export interface Sponsor {
  bioguideId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  party: string;
  state: string;
  district: number;
}

export interface Cosponsor extends Sponsor {
  isOriginalCosponsor: boolean;
  sponsorshipDate: string;
}

export interface Committee {
  name: string;
  chamber: string;
  type: string;
  systemCode: string;
  activities: {
    date: string;
    name: string;
  }[];
}

export interface Action {
  actionDate: string;
  actionCode: string;
  text: string;
  type: string;
  sourceSystem: {
    code: number;
    name: string;
  };
}

export interface Summary {
  actionDate: string;
  actionDesc: string;
  text: string;
  versionCode: string;
}

export interface TextVersion {
  date: string;
  formats: {
    type: string;
    url: string;
  }[];
  type: string;
}

export interface Title {
  title: string;
  titleType: string;
  titleTypeCode: number;
  updateDate: string;
}

export interface RelatedBill {
  congress: number;
  number: string;
  type: string;
  title: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  relationshipDetails: {
    identifiedBy: string;
    type: string;
  }[];
}

export interface Law {
  number: string;
  type: string;
}

export interface CboCostEstimate {
  description: string;
  pubDate: string;
  title: string;
  url: string;
}

export interface CommitteeReport {
  citation: string;
  url: string;
} 