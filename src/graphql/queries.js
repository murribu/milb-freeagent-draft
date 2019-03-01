// eslint-disable
// this is an auto generated file. This will be overwritten

export const getMyPicks = `query GetMyPicks {
  getMyPicks {
    playerId
    rank
  }
}
`;

export const getLeaders = `query GetLeaders {
  getLeaders {
    userId
    score
  }
}`;

export const getMyProfile = `query GetMyProfile {
  getMyProfile {
    score
    displayName
    twitterHandle
    facebookHandle
    email
  }
}`;

export const getUser = `query GetUser($id: String!) {
  getMyProfile(id: $id) {
    score
    displayName
    twitterHandle
    facebookHandle
  }
}`;
