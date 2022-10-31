import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Row, Col } from 'reactstrap';
import { FormBuilder } from 'components/form';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';
import { callApi } from 'store/middleware/api';

const defaultConfigs = {
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
    "6": "",
    "7": "",
    "8": "",
    "9": "",
    "10": "",
    "11": "",
    "12": ""
}

function LogisticUsers(props, ref) {
    const [configs, setConfigs] = useState([]);
    const [logisticusers, setLogisticusers] = useState([]);
    const formRefs = useRef([]);

    useEffect(() => {
        props.setLoading(true);
        callApi(`/byjusconfig/logisticusers`, 'GET', null, null, null, true)
            .then(response => {
                setLogisticusers(response);
                props.setLoading(false);
            })
            .catch(error => {
                props.setLoading(false);
            });
    }, []);

    /*
    * this effect/function runs only when props.configs(as its mentioned in dependacies) changes
    * it acts like a componentDidUpdate function which gets called only when props.configs changes
    * It resets the configs/formData whenever props.comfig changes
    */
    useEffect(() => {
        const newConfigs = { ...defaultConfigs, ...(props.configs || {}) };
        setConfigs(map(newConfigs, (logisticuser = {}, grade) => {
            const userId = get(logisticuser, 'userId');
            return { logisticUserId: userId, grade }
        }));
    }, [JSON.stringify(props.configs)]);



    useImperativeHandle(ref, () => ({
        validateFormAndGetValues() {
            const values = {};
            let isValid = true;

            formRefs.current.forEach(formRef => {
                const formValues = formRef.validateFormAndGetValues();
                if (!formValues) {
                    isValid = false;
                    return;
                }

                values[formValues.grade] = find(logisticusers, ["userId", formValues.logisticUserId]) || {};
            });

            if (isValid) return [values];
            return null;
        }
    }));



    const buildFields = (grade, logisticUserId) => {
        return [
            {
                type: "readonly",
                placeholder: "Grade",
                name: "grade"
            },
            {
                type: "select",
                placeholder: "Select user",
                name: "logisticUserId",
                options: logisticusers.map(logisticuser => ({
                    value: logisticuser.userId,
                    label: `${logisticuser.name} (${logisticuser.username})`
                }))
            }
        ]
    }

    formRefs.current = [];

    return (
        <Row>
            <Col>
                <Row>
                    <Col>
                        <h5>Grade</h5>
                    </Col>
                    <Col>
                        <h5>Logistic User</h5>
                    </Col>
                </Row>
                {
                    map(configs, ({ logisticUserId, grade }) => <FormBuilder
                        key={grade}
                        ref={ref => ref && formRefs.current.push(ref)}
                        initialValues={{ grade, logisticUserId }}
                        fields={buildFields(grade, logisticUserId)}
                        cols={2}
                    />)
                }
            </Col>
        </Row>
    )
}

export default forwardRef(LogisticUsers);