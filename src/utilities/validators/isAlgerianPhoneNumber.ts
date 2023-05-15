import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isAlgerianPhoneNumber', async: false })
export default class IsAlgerianPhoneNumber implements ValidatorConstraintInterface {
  validate(phoneNumber: string, args: ValidationArguments) {
    return /^\+213\d{9}$/.test(phoneNumber);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid Algerian phone number!';
  }
}