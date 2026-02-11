export const APP_NAME = 'Backend API'; // Change this for your project

export const PROFILE_PICTURE_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
};

export const USER_STATUS = Object.values(UserStatus);

export const USER_STATUS_MAP = {
  [UserStatus.ACTIVE]: 'active',
  [UserStatus.INACTIVE]: 'inactive',
  [UserStatus.BANNED]: 'banned',
};

// Update roles based on your project needs
export const USER_ROLE = {
  admin: 'admin',
  user: 'user',
};
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
