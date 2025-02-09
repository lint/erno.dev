const stateRegions = [
    {
        id: 'usa',
        label: 'United States',
        items: [
            {
                id: 'northeast',
                label: 'Northeast',
                items: [
                    {
                        id: 'new_england',
                        label: 'New England',
                        items: [
                            { id: 'ct', short: 'CT', label: 'Connecticut' },
                            { id: 'me', short: 'ME', label: 'Maine' },
                            { id: 'ma', short: 'MA', label: 'Massachusetts' },
                            { id: 'nh', short: 'NH', label: 'New Hampshire' },
                            { id: 'ri', short: 'RI', label: 'Rhode Island' },
                            { id: 'vt', short: 'VT', label: 'Vermont' },
                        ]
                    },
                    {
                        id: 'mid_atlantic',
                        label: 'Middle Atlantic',
                        items: [
                            { id: 'nj', short: 'NJ', label: 'New Jersey' },
                            { id: 'ny', short: 'NY', label: 'New York' },
                            { id: 'pa', short: 'PA', label: 'Pennsylvania' },
                        ]
                    }
                ]
            },
            {
                id: 'midwest',
                label: 'Midwest',
                items: [
                    {
                        id: 'east_north_central',
                        label: 'East North Central',
                        items: [
                            { id: 'il', short: 'IL', label: 'Illinois' },
                            { id: 'in', short: 'IN', label: 'Indiana' },
                            { id: 'mi', short: 'MI', label: 'Michigan' },
                            { id: 'wi', short: 'WI', label: 'Wisconsin' },
                        ]
                    },
                    {
                        id: 'west_north_central',
                        label: 'West North Central',
                        items: [
                            { id: 'ia', short: 'IA', label: 'Iowa' },
                            { id: 'ks', short: 'KS', label: 'Kansas' },
                            { id: 'mn', short: 'MN', label: 'Minnesota' },
                            { id: 'mo', short: 'MO', label: 'Missouri' },
                            { id: 'ne', short: 'NE', label: 'Nebraska' },
                            { id: 'nd', short: 'ND', label: 'North Dakota' },
                            { id: 'sd', short: 'SD', label: 'South Dakota' },
                        ]
                    }
                ]
            },
            {
                id: 'south',
                label: 'South',
                items: [
                    {
                        id: 'south_atlantic',
                        label: 'South Atlantic',
                        items: [
                            { id: 'fl', short: 'FL', label: 'Florida' },
                            { id: 'in', short: 'IN', label: 'Georgia' },
                            { id: 'nc', short: 'NC', label: 'North Carolina' },
                            { id: 'sc', short: 'SC', label: 'South Carolina' },
                            { id: 'va', short: 'VA', label: 'Virginia' },
                            { id: 'dc', short: 'DC', label: 'Washington, D.C.' },
                            { id: 'md', short: 'MD', label: 'Maryland' },
                            { id: 'de', short: 'DE', label: 'Delaware' },
                            { id: 'wv', short: 'WV', label: 'West Virginia' },
                        ]
                    },
                    {
                        id: 'east_south_central',
                        label: 'East South Central',
                        items: [
                            { id: 'al', short: 'AL', label: 'Alabama' },
                            { id: 'ky', short: 'KY', label: 'Kentucky' },
                            { id: 'ms', short: 'MS', label: 'Mississippi' },
                            { id: 'tn', short: 'TN', label: 'Tennessee' },
                        ]
                    },
                    {
                        id: 'west_south_central',
                        label: 'West South Central',
                        items: [
                            { id: 'ar', short: 'AR', label: 'Arkansas' },
                            { id: 'la', short: 'LA', label: 'Louisiana' },
                            { id: 'ok', short: 'OK', label: 'Oklahoma' },
                            { id: 'tx', short: 'TX', label: 'Texas' },
                        ]
                    }
                ]
            },
            {
                id: 'west',
                label: 'West',
                items: [
                    {
                        id: 'mountain',
                        label: 'Mountain',
                        items: [
                            { id: 'az', short: 'AZ', label: 'Arizona' },
                            { id: 'co', short: 'CO', label: 'Colorado' },
                            { id: 'id', short: 'ID', label: 'Idaho' },
                            { id: 'mt', short: 'MT', label: 'Montana' },
                            { id: 'nv', short: 'NV', label: 'Nevada' },
                            { id: 'nm', short: 'NM', label: 'New Mexico' },
                            { id: 'ut', short: 'UT', label: 'Utah' },
                            { id: 'wy', short: 'WY', label: 'Wyoming' },
                        ]
                    },
                    {
                        id: 'pacific',
                        label: 'Pacific',
                        items: [
                            { id: 'ak', short: 'AK', label: 'Alaska' },
                            { id: 'ca', short: 'CA', label: 'California' },
                            { id: 'hi', short: 'HI', label: 'Hawaii' },
                            { id: 'or', short: 'OR', label: 'Oregon' },
                            { id: 'wa', short: 'WA', label: 'Washington' },
                        ]
                    }
                ]
            }
        ]
    }
];
export default stateRegions;