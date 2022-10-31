import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Row, Col } from 'reactstrap';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';

function SplitViewContainer({
    maximized, condensed, children, condensedColumns, ...gridProps
}, ref) {
    const columns = condensed && condensedColumns;
    const gridRef = useRef();
    useImperativeHandle(ref, () => ({
        ...gridRef && gridRef.current
    }))

    return (
        <Row>
            <Col sm={condensed ? 3 : 12} className={`${condensed ? "px-1 " : ""}${maximized ? 'd-none' : ''}`}>
                <ByjusGrid
                    {...gridProps}
                    ref={gridRef}
                    columns={columns || gridProps.columns}
                    compactView={condensed}
                />
            </Col>
            {
                condensed && <Col>
                    {children}
                </Col>
            }
        </Row>
    )
}

export default forwardRef(SplitViewContainer)