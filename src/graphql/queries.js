// eslint-disable
// this is an auto generated file. This will be overwritten

export const getPlayer = `query GetPlayer($id: ID!) {
  getPlayer(id: $id) {
    id
    title
    content
    price
    rating
  }
}
`;
export const listPlayers = `query ListPlayers(
  $filter: ModelPlayerFilterInput
  $limit: Int
  $nextToken: String
) {
  listPlayers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      content
      price
      rating
    }
    nextToken
  }
}
`;
