const emailParser = require('address-rfc2822');

const purgeEmails = (emails) => {
  emails = emails.trim();
  // ending with ',': 'abc@example.com,'
  let length = emails.length;
  if (emails[length-1] === ',') {
    emails = emails.substring(0, length - 1);
  }
  return emails;
};

/**
 * Format irregular email addresses
 * @param  {String} email
 * @return {String}
 * https://github.com/jackbowman/email-addresses/issues/13
 */
const EMAIL_REGEX = "[\\w]+(?:\\.[\\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\\w](?:[\\w-]*[\\w])?\\.)+[\\w](?:[\\w-]*[\\w])?";
const FORMAT_SEPERATOR = '#%&';
const EMAIL_SUFFIX = '@(?:[\\w](?:[\\w-]*[\\w])?\.)+[\\w](?:[\\w-]*[\\w])?'; // EMAIL_SUFFIX: @ + domain
const formatAddress = (emails) => {
  let seperator_regex = new RegExp(EMAIL_SUFFIX + '>?(\\s*,)', 'g');
  emails = emails.replace(seperator_regex, (match, p1) => {
    return match.replace(p1, FORMAT_SEPERATOR);
  });
  let regex = new RegExp("^[^\"|\'].*(?=<" + EMAIL_REGEX + ">)");
  return emails.split(FORMAT_SEPERATOR).map((email) => {
    return email.replace(regex, '"' + '$&'.trim() + '" ');
  }).join(", ");
};

/**
 * Parse emails from string
 * @param  {String} emails
 * @return [{Address}] Address object by address-rfc2822
 */
export const parseEmailAddress = (emails) => {
  emails = purgeEmails(emails);
  let result;
  try {
    result = emailParser.parse(emails);
  } catch (e) {
    emails = formatAddress(emails);
    result = emailParser.parse(emails);
  }
  return result;
};
