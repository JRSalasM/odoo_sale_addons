import property from "./property";
import { isValidDeliveryDay, isAfter1PM, isBeforeToday } from '../helpers/deliveryDays'

const getFieldAddressTypes = property(['$children', '0', 'localValueResult', 'types']);
const getFieldAddressState = property(['$children', '0', 'localValueResult', 'state']);
const getFieldisValidatedAddress = property(['$children', '0', 'isValidatedAddress']);

// Each of these functions checks the input string for a validation rule
// If there is a validation error then the function returns the error message string that is shown to the user
// If there is no validation error then the function returns undefined.
const validationRuleFunctions = {
    // <text> checks
    required(s) {
        if (!s || !(s.length > 0))
            return 'This field is required.';
    },
    days(str) {
        if (typeof str!='string') return 'Please enter a text value into this field.';
        const msg=str.split(',')
            .map(s => s.trim())
            .filter(s => !/^[0-9]{1,2}[-./][a-zA-Z0-9]{1,3}[-./][0-9]{2,4}$/.test(s))
            .map(s => '"'+s+'"')
            .join(',');
        /* istanbul ignore else */
        if (msg) return 'Please enter dates, separated by commas.'+ (msg.length > 2 ? ' Need to change '+msg : '');
    },
    date(str) {
        if (!/^[0-9]{1,2}[-./][a-zA-Z0-9]{1,3}[-./][0-9]{2,4}$/.test(str))
            return 'Please choose or enter a valid date.';
    },
    future(str) {
        if (isBeforeToday(str))
            return 'Please select a date in the future.';
    },
    before1pm(str) {
        if (isAfter1PM(str))
            return 'Order before 1pm for same day delivery. Please choose tomorrow instead.';
    },
    delivery(str) {
        if (!isValidDeliveryDay(str))
            return `Sorry we do not deliver on the ${str}. Please choose another date.`;
    },
    // <input> types
    text(s) {
        if (typeof s!='string')
            return 'Please enter a text value into this field.';
    },
    email(s) {
        if (!/^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*|)$/.test(s))
            return 'Please enter a valid email address.';
    },
    tel(s) {
        if (!/^([0-9()+ *#,;/]{0,40}|)$/.test(s))
            return 'Please enter a valid phone number.';
    },
    // <textarea> types
    textarea(s) {
        if (typeof s !='string')
            return 'Please enter a text value into this field.';
    },
    // <checkbox> types
    boolean(v) {
        if (typeof v !='boolean')
            return 'Please enter a true or false value into this field.';
    },
    // <radio> types
    enum(s) {
        if (typeof s !='string')
            return 'Please choose one of the options.';
    },
    // <integer> types
    integer(n) {
        if (typeof n !='number')
            return 'Please enter a whole number.';
    },
    // <text> address types
    address(str, vm) {
        const check = vm ? getFieldisValidatedAddress(vm) : str;
        if (!check)
            return 'Cannot locate address. Please retype and select from the dropdown list.';
    },
    // <text> address types
    specific(str, vm) {
        const check = vm ? getFieldAddressTypes(vm) : str;
        if (check && /^(route|locality, political|administrative_area_level_1, political|country, political)$/.test(check))
            return 'Please select a specific delivery address.';
    },
    // <text> address types
    extra(str, vm) {
        const check = vm ? getFieldAddressTypes(vm) : str;
        if (check && /(hospital|school|university|shopping_mall|department_store)/.test(check))
            return 'Additional delivery charge will be added for Hospitals, Schools, Universities and Shopping Malls.';
    },
    // <text> address types
    nsw(str, vm) {
        const state = vm ? getFieldAddressState(vm) : str;
        if (state && state!='NSW')
            return 'Please select an address in NSW.';
    },
}

export default function validate(value, rules, vm) {

    function checkValueForValidationReqirements(acc, rule) {
        const trule = rule.trim();
        const msg = !validationRuleFunctions[trule] ? `Cannot find validation check "${trule}".`
            : validationRuleFunctions[trule](value, vm); //call the validationRuleFunction
        if (msg)  acc.push(msg)

        return acc;
    }

    if (typeof rules != 'string') return '';

    // for all the comma separated rules, reduce to a list of error messages.
    return rules.split(',')
        .reduce(checkValueForValidationReqirements, [])
        .join(' ');
}