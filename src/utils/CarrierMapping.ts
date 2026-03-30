import airtelLogo from '../assets/sim-carriers/airtel.png';
import jioLogo from '../assets/sim-carriers/jio.png';
import viLogo from '../assets/sim-carriers/vodafone_idea.png';
import bsnlLogo from '../assets/sim-carriers/bsnl.png';
import mtnlLogo from '../assets/sim-carriers/mtnl.png';
import simCardIcon from '../assets/simcard.svg';

export interface CarrierMetadata {
    displayName: string;
    logo: string;
}

/**
 * Maps MCC/MNC codes to carrier metadata (display name and logo).
 * @param mcc Mobile Country Code (e.g., "404")
 * @param mnc Mobile Network Code (e.g., "45")
 * @param carrierName Fallback carrier name from the OS
 */
export const getCarrierMetadata = (mcc: string, mnc: string, carrierName: string): CarrierMetadata => {
    const mccInt = parseInt(mcc, 10);
    const mncInt = parseInt(mnc, 10);

    if (mccInt === 404) {
        // Airtel
        if (mncInt === 45 || mncInt === 92) {
            return { displayName: 'Airtel', logo: airtelLogo };
        }
        // Vi (Vodafone Idea)
        if ([4, 11, 20].includes(mncInt)) {
            return { displayName: 'Vi', logo: viLogo };
        }
        // BSNL
        if ([34, 38, 71].includes(mncInt)) {
            return { displayName: 'BSNL', logo: bsnlLogo };
        }
        // MTNL
        if (mncInt === 69) {
            return { displayName: 'MTNL', logo: mtnlLogo };
        }
    } else if (mccInt === 405) {
        // Jio
        if (mncInt === 840 || mncInt === 854) {
            return { displayName: 'Jio', logo: jioLogo };
        }
    }

    // Fallback: If unknown MCC/MNC, return the carrier name from the OS with a generic SIM icon
    return {
        displayName: carrierName || 'Unknown SIM',
        logo: simCardIcon
    };
};
