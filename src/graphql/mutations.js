// eslint-disable
// this is an auto generated file. This will be overwritten

export const addPick = `mutation AddPick($playerId:String!, $rank: Int!) {
  addPick(playerId: $playerId, rank:$rank) {
    playerId
    rank
  }
}
`;

export const removePick = `mutation RemovePick($playerId:String!) {
  removePick(playerId: $playerId) {
    playerId
    rank
  }
}
`;

export const updateProfile = `
mutation UpdateProfile($displayName:String, $twitterHandle: String, $facebookHandle: String) {
  updateProfile(displayName: $displayName, twitterHandle: $twitterHandle, facebookHandle: $facebookHandle) {
    twitterHandle
    displayName
    facebookHandle
  }
}`;
