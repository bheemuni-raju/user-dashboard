import React, { useState } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';
import { Button } from 'reactstrap';
import Notify from 'react-s-alert';
import { isEmpty } from 'lodash';

import { Box, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';

function EnumForm(props) {
    const { refreshGrid, onClose, data } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [templateData, setTemplateData] = useState(data || {
        app: "",
        module: "",
        enumId: "",
        description: "",
        enums: [{
            label: "",
            value: "",
            hidden: "",
            disabled: ""
        }]
    });

    const onChangeContent = (changeObject) => {
        const { jsObject } = changeObject;

        if (jsObject) {
            setTemplateData(jsObject)
        }
    }

    const onClickSave = () => {
        setLoading(true);
        const urlSuffix = isEmpty(data) ? 'create' : 'update';
        callApi(`/usermanagement/settings/enum/${urlSuffix}`, 'POST', templateData, null, null, true)
            .then((response) => {
                refreshGrid();
                Notify.success(`${response.enumId} is created`);
                setLoading(false);
                onClose();
            })
            .catch(error => {
                setLoading(false);
                setError(error.message);
                Notify.error(error.message);
            })
    }

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <JSONInput
                    width="100%"
                    placeholder={templateData}
                    theme="darktheme"
                    locale={locale}
                    onChange={onChangeContent}
                    waitAfterKeyPress={1000}
                />
                <hr />
                <div>
                    <Button color="primary" onClick={onClickSave}>Save</Button>{" "}
                    <Button color="danger" onClick={onClose}>Cancel</Button>{" "}
                </div>
            </BoxBody>
        </Box>
    )
}

export default EnumForm