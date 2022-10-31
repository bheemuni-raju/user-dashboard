import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupText, FormGroup, Input, Col } from 'reactstrap';
import { pullAt, cloneDeep } from 'lodash';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: '5px 15px',
    // change background colour if dragging
    //background: isDragging ? 'lightgreen' : 'grey',
    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    //background: isDraggingOver ? 'lightblue' : 'lightgrey',
    overflowY: 'auto',
    border: '1px solid #dadada',
    padding: 10,
    height: 360
});

const ColumnPreferenceBuilder = (props) => {
    const { availableColumns, selectedColumns, setSelectedColumns, setAvailableColumns } = props.options;

    function addToSelectedColumn(idx, column) {
        pullAt(availableColumns, [idx]);
        setAvailableColumns([
            ...availableColumns
        ])
        setSelectedColumns([
            ...selectedColumns,
            column
        ]);
    }

    function removeFromSelectedColumn(idx, column) {
        pullAt(selectedColumns, [idx]);
        setAvailableColumns([
            ...availableColumns,
            column
        ])
        setSelectedColumns([
            ...selectedColumns
        ]);
    }

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    /**
     * Moves an item from one list to another list.
     */
    const move = (source, destination, droppableSource, droppableDestination) => {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        destClone.splice(droppableDestination.index, 0, removed);

        const result = {};
        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;

        return result;
    };

    function getList(id) {
        if (id === "availableColumns") {
            return availableColumns;
        }
        else {
            return selectedColumns;
        }
    }

    function onDragEnd(result) {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                getList(source.droppableId),
                source.index,
                destination.index
            );

            if (source.droppableId === 'availableColumns') {
                setAvailableColumns(items);
            }

            if (source.droppableId === 'selectedColumns') {
                //state = { selected: items };
                setSelectedColumns(items);
            }
        } else {
            const result = move(
                getList(source.droppableId),
                getList(destination.droppableId),
                source,
                destination
            );

            setAvailableColumns(result.availableColumns);
            setSelectedColumns(result.selectedColumns);
        }
    }

    return (
        <>
            <FormGroup row className="text-muted text-uppercase">
                <h5 className="col-lg-3 col-md-4">Available Columns</h5>
                <h5 className="offset-lg-2 offset-md-3 col-lg-3 col-md-4">Selected Columns</h5>
            </FormGroup>
            <FormGroup row className="column-selection">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Col lg={4} md={5} className="column-list">
                        <InputGroup>
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                    <i className="fa fa-search"></i>
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input name="search-columns" />
                        </InputGroup>

                        <Droppable droppableId="availableColumns">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {availableColumns.map((item, idx) => (
                                        <Draggable
                                            key={idx}
                                            draggableId={item.label || item.text}
                                            index={idx}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}
                                                >
                                                    {item.label || item.text}
                                                    <span
                                                        className="fa fa-plus cursor-pointer float-right"
                                                        onClick={() => addToSelectedColumn(idx, item)}
                                                    >
                                                    </span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                    </Col>
                    <Col lg={1} md={1} className="text-muted text-center" style={{ paddingTop: 100 }}>
                        <i className="fa fa-arrow-circle-right fa-2x"></i>
                    </Col>
                    <Col lg={4} md={5}>
                        <Droppable droppableId="selectedColumns">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}>
                                    {selectedColumns.map((item, idx) => (
                                        <Draggable
                                            key={idx}
                                            draggableId={item.label || item.text}
                                            index={idx}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}>
                                                    {item.label || item.text}
                                                    <span
                                                        className="fa fa-minus-circle cursor-pointer float-right"
                                                        onClick={() => removeFromSelectedColumn(idx, item)}
                                                    >
                                                    </span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </Col>
                </DragDropContext>
            </FormGroup>
        </>
    )
}

export default ColumnPreferenceBuilder;