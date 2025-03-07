
const topCities = [
    {
        state: 'az',
        city: 'mesa',
        value: 'az/Mesa',
        file_parts: 1,
    },
    {
        state: 'az',
        city: 'phoenix',
        value: 'az/Phoenix',
        file_parts: 1,
    },
    {
        state: 'az',
        city: 'tuscon',
        value: 'az/Tuscon',
        file_parts: 1,
    },
    {
        state: 'ca',
        city: 'fresno',
        value: 'ca/Fresno',
        file_parts: 1,
    },
    {
        state: 'ca',
        city: 'long_beach',
        value: 'ca/Long Beach',
        file_parts: 1,
    },
    {
        state: 'ca',
        city: 'los_angeles',
        value: 'ca/Los Angeles',
        file_parts: 3,
    },
    {
        state: 'ca',
        city: 'oakland',
        value: 'ca/Oakland',
        file_parts: 1,
    },
    {
        state: 'ca',
        city: 'sacramento',
        value: 'ca/Sacramento',
        file_parts: 1,
    },
    {
        state: 'ca',
        city: 'san_diego',
        value: 'ca/San Diego',
        file_parts: 2,
    },
    {
        state: 'ca',
        city: 'san_francisco',
        value: 'ca/San Francisco',
        file_parts: 1,
    },
    {
        state: 'ca',
        city: 'san_jose',
        value: 'ca/San Jose',
        file_parts: 2,
    },
    {
        state: 'co',
        city: 'colorado_springs',
        value: 'co/Colorado Springs',
        file_parts: 1,
    },
    {
        state: 'co',
        city: 'denver',
        value: 'co/Denver',
        file_parts: 1,
    },
    {
        state: 'dc',
        city: 'washington',
        value: 'dc/Washington',
        file_parts: 1,
    },
    {
        state: 'fl',
        city: 'jacksonville',
        value: 'fl/Jacksonville',
        file_parts: 2,
    },
    {
        state: 'fl',
        city: 'miami',
        value: 'fl/Miami',
        file_parts: 1,
    },
    {
        state: 'ga',
        city: 'atlanta',
        value: 'ga/Atlanta',
        file_parts: 1,
    },
    {
        state: 'il',
        city: 'chicago',
        value: 'il/Chicago',
        file_parts: 2,
    },
    {
        state: 'in',
        city: 'indianapolis',
        value: 'in/Indianapolis',
        file_parts: 1,
    },
    {
        state: 'ks',
        city: 'wichita',
        value: 'ks/Wichita',
        file_parts: 1,
    },
    {
        state: 'ky',
        city: 'louisville',
        value: 'ky/Louisville',
        file_parts: 1,
    },
    {
        state: 'ma',
        city: 'boston',
        value: 'ma/Boston',
        file_parts: 1,
    },
    {
        state: 'md',
        city: 'baltimore',
        value: 'md/Baltimore',
        file_parts: 1,
    },
    {
        state: 'mi',
        city: 'detroit',
        value: 'mi/Detroit',
        file_parts: 2,
    },
    {
        state: 'mn',
        city: 'minneapolis',
        value: 'mn/Minneapolis',
        file_parts: 1,
    },
    {
        state: 'mo',
        city: 'kansas_city',
        value: 'mo/Kansas City',
        file_parts: 1,
    },
    {
        state: 'nc',
        city: 'charlotte',
        value: 'nc/Charlotte',
        file_parts: 2,
    },
    {
        state: 'nc',
        city: 'raleigh',
        value: 'nc/Raliegh',
        file_parts: 1,
    },
    {
        state: 'ne',
        city: 'omaha',
        value: 'ne/Omaha',
        file_parts: 1,
    },
    {
        state: 'nm',
        city: 'albuquerque',
        value: 'nm/Albuquerque',
        file_parts: 1,
    },
    {
        state: 'nv',
        city: 'las_vegas',
        value: 'nv/Las Vegas',
        file_parts: 1,
    },
    {
        state: 'ny',
        city: 'new_york',
        value: 'ny/New York',
        file_parts: 1,
    },
    {
        state: 'oh',
        city: 'cleveland',
        value: 'oh/Cleveland',
        file_parts: 1,
    },
    {
        state: 'oh',
        city: 'columbus',
        value: 'oh/Columbus',
        file_parts: 2,
    },
    {
        state: 'ok',
        city: 'oklahoma_city',
        value: 'ok/Oklahoma_city',
        file_parts: 1,
    },
    {
        state: 'ok',
        city: 'tulsa',
        value: 'ok/Tulsa',
        file_parts: 1,
    },
    {
        state: 'or',
        city: 'portland',
        value: 'or/Portland',
        file_parts: 2,
    },
    {
        state: 'pa',
        city: 'philadelphia',
        value: 'pa/Philadelphia',
        file_parts: 1,
    },
    {
        state: 'pa',
        city: 'pittsburgh',
        value: 'pa/Pittsburgh',
        file_parts: 1,
    },
    {
        state: 'tn',
        city: 'memphis',
        value: 'tn/Memphis',
        file_parts: 2,
    },
    {
        state: 'tn',
        city: 'nashville',
        value: 'tn/Nashville',
        file_parts: 1,
    },
    {
        state: 'tx',
        city: 'austin',
        value: 'tx/Austin',
        file_parts: 1,
    },
    {
        state: 'tx',
        city: 'dallas',
        value: 'tx/Dallas',
        file_parts: 1,
    },
    {
        state: 'tx',
        city: 'el_paso',
        value: 'tx/El Paso',
        file_parts: 1,
    },
    {
        state: 'tx',
        city: 'fort_worth',
        value: 'tx/Fort Worth',
        file_parts: 1,
    },
    {
        state: 'tx',
        city: 'houston',
        value: 'tx/Houston',
        file_parts: 2,
    },
    {
        state: 'tx',
        city: 'san_antonio',
        value: 'tx/San Antonio',
        file_parts: 2,
    },
    {
        state: 'va',
        city: 'virginia_beach',
        value: 'va/Virginia Beach',
        file_parts: 1,
    },
    {
        state: 'wa',
        city: 'seattle',
        value: 'wa/Seattle',
        file_parts: 1,
    },
    {
        state: 'wi',
        city: 'milwaukee',
        value: 'wi/Milwaukee',
        file_parts: 1,
    },
];
export default topCities;

export function cityDataForValue(value: string) {
    for (let city of topCities) {
        if (city.value === value) return city;
    }
    return undefined;
}