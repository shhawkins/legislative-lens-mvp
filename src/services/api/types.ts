// Base response type for all API calls
export interface ApiResponse<T> {
  pagination: {
    count: number;
    totalCount: number;
  };
  request: {
    contentType: string;
    format: string;
  };
  bills?: T[];
  members?: T[];
  committees?: T[];
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
  type: string;
  formats: {
    type: string;
    url: string;
  }[];
}

export interface Title {
  title: string;
  type: string;
  chamber: string;
  chamberCode: string;
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
  congress: number;
}

export interface CboCostEstimate {
  title: string;
  url: string;
  date: string;
}

export interface CommitteeReport {
  number: string;
  chamber: string;
  chamberCode: string;
  url: string;
}

// Member related types
export interface Member {
  bioguideId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  party: string;
  state: string;
  district: number;
  chamber: string;
  committees: {
    name: string;
    code: string;
    type: string;
    rank: string;
  }[];
  sponsoredBills: {
    count: number;
    list: {
      congress: number;
      number: string;
      type: string;
      title: string;
    }[];
  };
  cosponsoredBills: {
    count: number;
    list: {
      congress: number;
      number: string;
      type: string;
      title: string;
    }[];
  };
}

// Committee related types
export interface Committee {
  name: string;
  chamber: string;
  type: string;
  systemCode: string;
  members: {
    bioguideId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    party: string;
    state: string;
    district: number;
    rank: string;
  }[];
  subcommittees: {
    name: string;
    systemCode: string;
  }[];
  recentBills: {
    congress: number;
    number: string;
    type: string;
    title: string;
  }[];
} 