export const stateList: string[] = ['ak', 'al', 'ar', 'az', 'ca', 'co', 'ct', 'dc', 'de', 'fl', 'ga', 'hi', 'ia', 'id', 'il', 'in', 'ks', 'ky', 'la', 'ma', 'md', 'me', 'mi', 'mn', 'mo', 'ms', 'mt', 'nc', 'nd', 'ne', 'nh', 'nj', 'nm', 'nv', 'ny', 'oh', 'ok', 'or', 'pa', 'pr', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'va', 'vt', 'wa', 'wi', 'wv', 'wy'];

const stateRegions = [
    {
        // value: 'usa',
        // label: 'United States',
        // children: [
        //     {
        value: 'northeast',
        label: 'Northeast',
        children: [
            {
                value: 'new_england',
                label: 'New England',
                children: [
                    { value: 'ct', label: 'Connecticut' },
                    { value: 'me', label: 'Maine' },
                    { value: 'ma', label: 'Massachusetts' },
                    { value: 'nh', label: 'New Hampshire' },
                    { value: 'ri', label: 'Rhode Island' },
                    { value: 'vt', label: 'Vermont' },
                ]
            },
            {
                value: 'mid_atlantic',
                label: 'Middle Atlantic',
                children: [
                    { value: 'nj', label: 'New Jersey' },
                    { value: 'ny', label: 'New York' },
                    { value: 'pa', label: 'Pennsylvania' },
                ]
            }
        ]
    },
    {
        value: 'midwest',
        label: 'Midwest',
        children: [
            {
                value: 'east_north_central',
                label: 'East North Central',
                children: [
                    { value: 'il', label: 'Illinois' },
                    { value: 'in', label: 'Indiana' },
                    { value: 'oh', label: 'Ohio' },
                    { value: 'mi', label: 'Michigan' },
                    { value: 'wi', label: 'Wisconsin' },
                ]
            },
            {
                value: 'west_north_central',
                label: 'West North Central',
                children: [
                    { value: 'ia', label: 'Iowa' },
                    { value: 'ks', label: 'Kansas' },
                    { value: 'mn', label: 'Minnesota' },
                    { value: 'mo', label: 'Missouri' },
                    { value: 'ne', label: 'Nebraska' },
                    { value: 'nd', label: 'North Dakota' },
                    { value: 'sd', label: 'South Dakota' },
                ]
            }
        ]
    },
    {
        value: 'south',
        label: 'South',
        children: [
            {
                value: 'south_atlantic',
                label: 'South Atlantic',
                children: [
                    { value: 'de', label: 'Delaware' },
                    { value: 'fl', label: 'Florida' },
                    { value: 'ga', label: 'Georgia' },
                    { value: 'md', label: 'Maryland' },
                    { value: 'nc', label: 'North Carolina' },
                    { value: 'sc', label: 'South Carolina' },
                    { value: 'va', label: 'Virginia' },
                    { value: 'wv', label: 'West Virginia' },
                    { value: 'dc', label: 'Washington, D.C.' },
                ]
            },
            {
                value: 'east_south_central',
                label: 'East South Central',
                children: [
                    { value: 'al', label: 'Alabama' },
                    { value: 'ky', label: 'Kentucky' },
                    { value: 'ms', label: 'Mississippi' },
                    { value: 'tn', label: 'Tennessee' },
                ]
            },
            {
                value: 'west_south_central',
                label: 'West South Central',
                children: [
                    { value: 'ar', label: 'Arkansas' },
                    { value: 'la', label: 'Louisiana' },
                    { value: 'ok', label: 'Oklahoma' },
                    { value: 'tx', label: 'Texas' },
                ]
            }
        ]
    },
    {
        value: 'west',
        label: 'West',
        children: [
            {
                value: 'mountain',
                label: 'Mountain',
                children: [
                    { value: 'az', label: 'Arizona' },
                    { value: 'co', label: 'Colorado' },
                    { value: 'id', label: 'Idaho' },
                    { value: 'mt', label: 'Montana' },
                    { value: 'nv', label: 'Nevada' },
                    { value: 'nm', label: 'New Mexico' },
                    { value: 'ut', label: 'Utah' },
                    { value: 'wy', label: 'Wyoming' },
                ]
            },
            {
                value: 'pacific',
                label: 'Pacific',
                children: [
                    { value: 'ak', label: 'Alaska' },
                    { value: 'ca', label: 'California' },
                    { value: 'hi', label: 'Hawaii' },
                    { value: 'or', label: 'Oregon' },
                    { value: 'wa', label: 'Washington' },
                ]
            }
        ]
    },
    {
        value: 'territories',
        label: 'Territories',
        children: [
            { value: 'pr', label: 'Puerto Rico' },
        ]
    }
    // ]
    // }
];
export default stateRegions;
