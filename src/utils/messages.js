class Messages {
  static EMAIL_NOT_FOUND = "Sorry! We couldn't find an account with that email address";
  static PASSWORD_INCORRECT = "Incorrect password. Please try again or click on Forgot Password below.";
  static SET_PASSWORD = "You haven’t set a password during the sign up process. Please click on Forgot Password to create a new password.";
  static LOGIN = "You have successfully logged in";
  static LOGIN_WITH_OTP = "OTP has been sent to your email address.";
  static REGISTERED_WITH_GOOGLE = "You have registered your account using Google. Please use sign-in via Google to successfully login to your account.";
  static REGISTERED_WITH_FACEBOOK = "You have registered your account using  Facebook. Please use sign-in via Facebook to successfully login to your account.";
  static ACCOUNT_DELETED = "This account has been deleted and is no longer active.";
  static ACCOUNT_DISABLED = "This account has been disabled. Please contact your account administrator.";
  static EMAIL_NOT_VERIFY = "You need to verify your email address. Please check your inbox for the account activation link (including your spam/junk folder!).";
  static ID_NOT_FOUND = "Sorry! We couldn't find an account with that ID";
  static FORGOT_PASSWORD = "You should receive an email with instructions on how to reset your password shortly.";
  static INVALID_LINK = 'Unfortunately, this link now expired. Please request a new link by clicking "forgot password" on the login panel.';
  static VALID_LINK = "Your reset password link has been verified.";
  static REFRESH_TOKEN = "Tokens are refreshed.";
  static ACCOUNT_CREATED = "You need to verify your email address. Please check your inbox for the account activation link (including your spam/junk folder!).";
  static INVALID_TOKEN = "Your token has expired.";
  static RESET_PASSWORD = "Your password has been changed successfully!.";
  static LOGOUT_SUCCESS = "You have logged out successfully.";
  static ALREADY_EXITS = "This email address is already in use!";
  static VERIFIED_USER = "Your account has been verified successfully!";
  static VERIFIED_ALREADY = "Your account is already verified.";
  static REGISTERED_WITH_EMAIL = "You have registered your account using Email. Please use sign-in via Email to successfully login to your account.";
  static EMAIL_FOUND = "Email information has been fetched successfully.";
  static INVITE_FETCHED = "Invite user list fetched successfully.";
  static CREAT_JOB_CUSTOMER = "Transaction created successfully.";
  static JOB_DETAILS = "Transaction details fetched Successfully";
  static MILESTONE_CREATED = "Transaction created successfully.";
  static TRANSACTION_CREATED = "Transaction created successfully.";

  static JOB_LIST = "Transaction listing data fetched successfully";
  static GET_CUSTOMER_LIST = "Customer listing data Fetched successfully.";
  static STATUS_CHANGE = "Status Change successfully";
  static DASHBOARD_DATA_FETHCED = "Client data fetched successfully";
  static ONGOING_PAYMENT = "On going transaction fetched successfully";
  static ADMIN_DASHBOARD_DATA_FETHCED = "Admin data fetched successfully";

  static PASSWORD_CHANGED = "Your password has been changed successfully.";
  static OLD_PASSWORD_INCORRECT = "The old password is incorrect.";

  static JOB_ID_NOT_FOUND = "Sorry! We couldn't find an transaction with that ID";
  static JOB_ACCEPT = "Transaction accepted successfully";
  static JOB_REJECT = "Transaction rejected successfully";
  static MODIFICATION_REQUEST = "Transaction modification request sent successfully";
  static JOB_CONFIRM = "Transaction amount changed successfully.";
  static MILESTONE_DELETE = "Milestone deleted successfully.";
  static MILESTONE_UPDATE = "Milestone updated successfully.";
  static MILESTONE_ADDED = "Milestone added successfully.";


  static PAYMENT_ESCROW = "Your transaction is now in the Deposit Box.";
  static PAYMENT_FAILED = "Your transaction is Rejected.";
  static PAYMENT_CANCEL = "Your transaction is cancelled.";
  static PAYMENT_RELEASE = "Transaction is released. Client waiting for you to fund next transaction stage";
  static PAYMENT_RELEASE_COMPLETED = "Transaction released. The job is now complete.";
  static PAYMENT_RELEASE_REQUEST = "Transaction release request for this interim transaction sent successfully!";
  static PAYMENT_HISTORY = "Transaction history data fetched successfully!";

  static SUPPORT_TICKET_CREATED = "Support ticket raised successfully. We'll aim to respond within 24 hours.";
  static SUPPORT_TICKET_GET = "Support Ticket listing data fetched successfully";
  static SUPPORT_TICKET_GET_DETAILS = "Support Ticket details fetched successfully";
  static COMMENT_ADD = "Comment added successfully";
  static TICKET_RESOLVED = "Support Ticket resolved successfully";
  static TICKET_ID_NOT_FOUND = "Sorry! We couldn't find an support ticket with that ID";
  static BANK_NOT_FOUND = "Sorry! We couldn't find a your bank account.Please added your bank details after try to release request";
  static KYC_IN_PROGRESS = "Your KYC process is in progress";
  static KYC_REFUSED = "Sorry, we are unable to process your document due to a technical issue. Please upload again.";

  static DISPUTE_RAISED = "Query transaction raised successfully";
  static DISPUTE_GET = "Query transaction listing data fetched successfully";
  static DISPUTE_DETAILS_GET = "Query transaction details fetched successfully";
  static DISPUTE_MILESTONE_DETAILS_GET = "Query transaction milestone details fetched successfully";
  static DISPUTE_ANNOUNCE = "Query transaction resolution successfully";
  static DISPUTE_ID_NOT_FOUND = "Sorry! We couldn't find an query ticket with that ID";
  static DISPUTE_ACCEPT = "You have accepted query transaction";
  static DISPUTE_REJECT = "You have rejected query transaction";
  static DISPUTE_UPDATE = "Query transaction updated successfully";
  static BANK_INFO_UPDATE = "Financial Information updated successfully";
  static PERSONAL_INFO_UPDATE = "Personal Information updated successfully";


  static ADD_STAFF_MEMBER = "Staff Member added successfully";
  static UPDATE_STAFF_MEMBER = "Staff Member updated successfully";
  static GET_STAFF_MEMBER = "Staff Member listing data fetched successfully.";
  static DELETE_STAFF_MEMBER = "Staff Member deleted successfully";
  static WRONG_OTP = "You have entered invalid otp. Please enter a valid otp";

  static NOTIFICATION_GETS = "Notifications listing data fetched successfully";

  static UPDATE_UBO_SUCCESS = "Your new UBO information updated successfully"
  static ADD_UBO_SUCCESS = "Your UBO information added successfully"
  static COMPANY_UPDATE_SUCCESS = "Your company information updated successfully"
  static PROFILE_PIC_UPDATED = "Your profile picture updated successfully";
  static OTP_VERIFY_SUCCESS = "Your login OTP verification successfully";
  static OTP_VERIFY_SUCCESS = "Your login OTP verification successfully";

  static EXPIRED_VERIFICATION_TOKEN = "Unfortunately, this link has now expired.";
  static LINK_RESEND_SUCCESS = "Verification link sent successfully."
}

module.exports = Messages
