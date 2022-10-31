import React from 'react';
import { get } from 'lodash';
import { Form, FormGroup, Col, Input } from 'reactstrap';
import ByjusComboBox from '../combobox/ByjusComboBox';

export default function QuickSearchBox({
    colOptions,
    onSearch,
    style,
    searchText, setSearchText,
    columnField, setColumnField
}) {
    // const [columnField, setColumnField] = useState(null);
    // const [searchText, setSearchText] = useState(null);

    const onChangeField = (name, selectedOption) => {
        setColumnField(get(selectedOption, 'value'));
    }

    const onSearchKeyPress = (event) => {
        if (event.key === 'Enter') {
            onSearch(columnField, searchText);
        }
    }

    return (
        <Form style={style}>
            <FormGroup row className="mb-0">
                <Col md={5} className="pr-0">
                    <ByjusComboBox
                        name="columnField"
                        value={columnField}
                        options={colOptions}
                        onChange={onChangeField}
                        customStyles={{ height: '37px' }}
                    />
                </Col>
                <Col md={7} className="pl-1">
                    <Input
                        type="text"
                        name="searchText"
                        value={searchText || ""}
                        width={300}
                        placeholder="Enter comma seperated values"
                        onChange={event => { setSearchText(event.target.value); }}
                        onKeyPress={onSearchKeyPress}
                    />
                </Col>
            </FormGroup>
        </Form>
    )
}