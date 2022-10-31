import React, { useRef, useState } from 'react';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';

const LanguagesList = () =>{
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    let byjusGridRef = useRef();

    return (
        <Box>
        <BoxBody loading={loading} error={error}>
          <ByjusGrid
            gridId="ums_languages_grid"
            ref={byjusGridRef}
            modelName="Languages"
            gridDataUrl="/usermanagement/language/list"
          />
        </BoxBody>
      </Box>
    )
}

export default LanguagesList;