import { get, upperCase } from 'lodash';

export const alphabetColorCoding = (alphabet = "") => {
    alphabet = alphabet.toUpperCase();

    if (["A", "B", "C", "D", "E"].includes(alphabet)) {
        return { color: 'white', backgroundColor: '#eb2f96', borderColor: "#ffadd2" }
    }
    else if (["F", "G", "H", "I", "J"].includes(alphabet)) {
        return { color: 'white', backgroundColor: '#722ed1', borderColor: "#d3adf7" }
    }
    else if (["K", "L", "M", "N", "O"].includes(alphabet)) {
        return { color: 'white', backgroundColor: '#faad14', borderColor: "#ffe58f" }
    }
    else if (["P", "Q", "R", "S", "T"].includes(alphabet)) {
        return { color: 'white', backgroundColor: '#13c2c2', borderColor: "#87e8de" }
    }
    else if (["U", "V", "W", "X", "Y", "Z"].includes(alphabet)) {
        return { color: 'white', backgroundColor: '#eaff8f', borderColor: "#a0d911" }
    }
}

export const isValidHttpUrl = (string) => {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

export const cycleNameFormatter = (cycle_name) => {
    if (cycle_name === "" || cycle_name === null || cycle_name === undefined) {
        return "N/A";
    }

    const eachWords = cycle_name.split("_");

    const getYear = get(eachWords, "0", "");
    const getWeek = get(eachWords, "1", "");
    const getStartDate = get(eachWords, "2", "");
    const getEndDate = get(eachWords, "3", "");
    return `${upperCase(getWeek)} (${upperCase(getStartDate)} - ${upperCase(getEndDate)}, ${getYear})`;
}

export const indexColorCoding = (idx) => {
    const colorMap = {
        0: { color: 'white', backgroundColor: '#eb2f96', borderColor: "#ffadd2" },
        1: { color: 'white', backgroundColor: '#722ed1', borderColor: "#d3adf7" },
        2: { color: 'white', backgroundColor: '#1DE9B6', borderColor: "#ffe58f" },
        3: { color: 'white', backgroundColor: '#2f54eb', borderColor: "#87e8de" },
        4: { color: 'black', backgroundColor: '#eaff8f', borderColor: "#a0d911" },

        5: { color: 'white', backgroundColor: '#faad14', borderColor: "#a0d911" },
        6: { color: 'white', backgroundColor: '#1DE9B6', borderColor: "#a0d911" },
        7: { color: 'white', backgroundColor: '#f5222d', borderColor: "#a0d911" },
        8: { color: 'white', backgroundColor: '#5b8c00', borderColor: "#a0d911" },
        9: { color: 'white', backgroundColor: '#722ed1', borderColor: "#a0d911" },
        10: { color: 'white', backgroundColor: '#fa8c16', borderColor: "#a0d911" },
        11: { color: 'white', backgroundColor: '#d48806', borderColor: "#a0d911" },
        12: { color: 'white', backgroundColor: '#13c2c2', borderColor: "#a0d911" }
    };

    return colorMap[idx];
}

// Explicitly added the role senior_bda as its not present in the role collection.
export const options = [
    { label: 'BDT', value: 'bdt' },
    { label: 'BDA', value: 'bda' },
    { label: 'BDAT', value: 'bdat' },
    { label: 'Senior BDA', value: 'senior_bda' },
    { label: 'BDTM', value: 'bdtm' },
    { label: 'Team Manager', value: 'team_manager' },
    { label: 'Assistant Senior BDTM', value: 'assistant_senior_bdtm' },
    { label: 'Assistant Senior Manager', value: 'assistant_senior_manager' },
    { label: 'Senior BDTM', value: 'senior_bdtm' },
    { label: 'Senior Manager', value: 'senior_manager' },
    { label: 'AGM', value: 'agm' },
    { label: 'GM', value: 'gm' },
    { label: 'AVP', value: 'avp' },
    { label: 'HRBP Lead', value: 'hrbp_lead' },
    { label: 'Director', value: 'director' },
    { label: 'Team Head', value: 'team_head' },
];

export const smsTemplateStatusColourMap = {
    'created': 'secondary',
    'pending': 'warning',
    'sent_for_approval': 'info',
    'approved': 'success',
    'rejected': 'danger',
    'deactivated': 'primary',
    'soft_deleted': 'light'
};
