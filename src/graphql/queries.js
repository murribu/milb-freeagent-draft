// eslint-disable
// this is an auto generated file. This will be overwritten

export const getMyPicks = `query GetMyPicks {
  getMyPicks {
    playerId
    rank
  }
}
`;

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
  getUser(id: $id) {
    displayName
    twitterHandle
    facebookHandle
  }
}`;

export const getUserPicks = `query GetUserPicks($id: String!) {
  getUserPicks(id: $id) {
    playerId
    rank
  }
}`;
