export class DynamicMessages {
  static createMessage(name: string): string {
    return `${name} created successfully`;
  }

  static fetched(name: string): string {
    return `${name} fetched successfully`;
  }

  static deleteMessage(name: string): string {
    return `${name} deleted successfully`;
  }

  static updateMessage(name: string): string {
    return `${name} updated successfully`;
  }

  static notFoundMessage(name: string): string {
    return `${name} not found`;
  }

  static doesNotExistMessage(name: string): string {
    return `${name} does not exist`;
  }

  static alreadyExistMessage(name: string): string {
    return `${name} already exist`;
  }

  static invalid(name: string): string {
    return ` Invalid ${name}`;
  }
}

export const PLAIN_RESPONSE_MSG = {
  serverError: 'Internal Server Error',
  invalidCredentials: 'Invalid Credentials',
  invalidToken: 'Invalid Token',
  invalidOtp: 'Invalid OTP',
  tokenExpired: 'Token Expired',
  invalidEmail: 'Invalid Email',
  emailAlreadyExists: 'Email Already Exists',
  invalidPassword: 'Invalid Password',
  welcomeMessage: 'Welcome to the E-Commerce CMS API',
  dataFetched: 'Data Fetched Successfully',
  dataUpdated: 'Data Updated Successfully',
  dataInserted: 'Data Inserted Successfully',
  dataDeleted: 'Data Deleted Successfully',
  adminCreated: 'Admin Created Successfully',
  adminNotFound: 'Admin Not Found',
  permissionsUpdate: 'Permissions Update Successfully',
  passwordStrength:
    'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character',
  invalidAuth: 'Invalid email or password',
  validLogin: 'Logged in Successfully',
  unAuthorized: 'You are not authorized to perform this action',
  unAuthenticated: 'You are not login. Please login first.',
  notStore: 'You have no access to this store.',
  mediaUploaded: 'Media Uploaded Successfully',
  invalidContactNumber: 'Invalid Contact Number',
  invalidProjectId: 'Invalid Project',
  actionCompleted: 'Action completed successfully',
  contactNumberExist: 'Contact Number Already Exist',
  adminDeleted: 'Admin Deleted Successfully',
  invalidDateFormat: 'Invalid Date Format',
  invalidProject: 'Invalid Project',
  invalidRequest: 'Invalid Request',
  invalidDate: 'Date should be in format mm/dd/yyyy',
  internalServerError: 'Internal Server Error',
  somethingWrong: 'Something went wrong',
  passwordNotMatch: 'Password and Confirm Password does not match',
  invalidRole: 'Invalid Role',
  invalidFile: 'Invalid file type',
  passwordResetEmail: 'An email containing a password reset link has been sent to your email.',
  passwordReset: 'Password Reset Successfully',
  verifiedAccount: 'Account verified successfully',
  unVerifiedAccount: 'Verify your account first.',
};
