import NDK, { NDKEvent, NDKKind, type NDKUser } from "@nostr-dev-kit/ndk";

export async function followMultipleUsers(
  ndk: NDK,
  currentUser: NDKUser,
  pubkeysToFollow: string[]
): Promise<void> {
  if (!currentUser.pubkey) {
    throw new Error('Current user has no pubkey');
  }

  const existingFollowList = await ndk.fetchEvent({
    kinds: [NDKKind.Contacts],
    authors: [currentUser.pubkey],
  });

  const currentFollows = new Set<string>();

  if (existingFollowList) {
    existingFollowList.tags
      .filter(tag => tag[0] === 'p')
      .forEach(tag => currentFollows.add(tag[1]));
  }

  pubkeysToFollow.forEach(pubkey => currentFollows.add(pubkey));

  const newFollowList = new NDKEvent(ndk);
  newFollowList.kind = NDKKind.Contacts;
  newFollowList.tags = Array.from(currentFollows).map(pubkey => ['p', pubkey]);
  newFollowList.content = existingFollowList?.content || '';

  await newFollowList.publishReplaceable();
}

export async function followUser(
  ndk: NDK,
  currentUser: NDKUser,
  pubkeyToFollow: string
): Promise<void> {
  return followMultipleUsers(ndk, currentUser, [pubkeyToFollow]);
}

export async function unfollowUser(
  ndk: NDK,
  currentUser: NDKUser,
  pubkeyToUnfollow: string
): Promise<void> {
  if (!currentUser.pubkey) {
    throw new Error('Current user has no pubkey');
  }

  const existingFollowList = await ndk.fetchEvent({
    kinds: [NDKKind.Contacts],
    authors: [currentUser.pubkey],
  });

  if (!existingFollowList) {
    return;
  }

  const currentFollows = new Set<string>();
  existingFollowList.tags
    .filter(tag => tag[0] === 'p')
    .forEach(tag => currentFollows.add(tag[1]));

  currentFollows.delete(pubkeyToUnfollow);

  const newFollowList = new NDKEvent(ndk);
  newFollowList.kind = NDKKind.Contacts;
  newFollowList.tags = Array.from(currentFollows).map(pubkey => ['p', pubkey]);
  newFollowList.content = existingFollowList.content || '';

  await newFollowList.publishReplaceable();
}