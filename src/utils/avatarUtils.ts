export const getAvatarPosition = (avatarId: string): string => {
    if (!avatarId) return "0px 0px"; // Default position if no avatar is set

    const spriteSize = 64; // Each avatar is 64x64 pixels
    const columns = 7; // 7 avatars per row
    const initialOffsetX = 0;
    const initialOffsetY = -10;

    // Extract the avatar index from the ID (e.g., "avatar5" -> 5)
    const index = parseInt(avatarId.replace("avatar", ""), 10) - 1;
    if (isNaN(index) || index < 0 || index >= 56) return "0px 0px"; // Ensure valid index

    // Calculate row and column based on 7x7 grid
    const row = Math.floor(index / columns);
    const col = index % columns;

    // Compute the background position
    const x = initialOffsetX - col * spriteSize;
    const y = initialOffsetY - row * spriteSize;

    return `${x}px ${y}px`;
};
