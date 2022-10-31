import React, {Component} from 'react'
import {connect} from 'react-redux'
import { withRouter } from 'react-router'

import { Field, reduxForm } from 'redux-form'
import { Box, BoxBody, BoxHeader } from '../../../../components/box'
import { Page, PageBody, PageHeader } from '../../../../components/page'
import {Modal, Button} from 'reactstrap'
import ImportWizard from './ImportWizard'
import UploadWizard from './UploadWizard'

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
})

class ImportRecords extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modelName : this.props.modelName,
            uniqueCol : this.props.uniqueCol,
            file : null,
            page : 1,
            uploadSummary : null,
            showResultDialog : false,
            insertedRecords : 0,
            updatedRecords : 0,
            isImported : false
        }
    }

    onClickCancel = () => {
        this.props.history.goBack()
    }

    onClickPrevious= () => {
        this.setState({
           page: this.state.page - 1
        })
    }

    onClickNext = () => {
        this.setState({
            page: this.state.page + 1
        })
    }

    onChangeFile =  (e) =>{
        const file = e.target.files[0]
        const fileType = file.name.split('.')[1]

        if(fileType == "csv"){
            this.setState({
                file:file,
                uploadSummary : null
            })
        }
        else{
            this.setState({
                file:null,
                uploadSummary : null
            })
            alert("Select a CSV file")
        }
      }

    onClickUploadOrImport =(e) => {
        const btnName = e.target.name
        e.preventDefault()
        const formData = new FormData();
        const { file, modelName, uniqueCol   } = this.state
        formData.append('file', file)
        formData.append('model', modelName)
        formData.append('uniqueCol', uniqueCol)

        fetch(`${window.NAPI_URL}/${modelName.toLowerCase()}/${btnName}`, {
            method : 'POST',
            headers: {
                'encType' : "multipart/form-data",
                'Accept' : 'application/json'
                },
            body : formData
        }).then(response => {
            response.json().then(res =>{
                btnName == "upload" ? this.onUploadSuccess(res) : this.onImportSuccess(res)
            })
        })
    }

    onImportSuccess =  (res) => {
        console.log(res)
        this.setState({
            showResultDialog : true,
            insertedRecords : res.newRecords.length,
            updatedRecords : res.existingRecords.length,
            isImported : true

        })
    }

    onUploadSuccess = (res) => {
        console.log(res)
        this.setState({
            uploadSummary: res,
            page : this.state.page+1
        })
    }

    getImportDetailsModal = () => {
        return (
            <Modal
                show={this.state.showResultDialog}
                onHide={this.handleModalHide}
                container={this}
                aria-labelledby="contained-modal-title"
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">
                    Import Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>No. of Items Inserted :  {this.state.insertedRecords}</p>
                    <p>No. of Items Updated  :   {this.state.updatedRecords}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleModalHide}>Close</Button>
                </Modal.Footer>
            </Modal>)
    }
    
    handleModalHide = () => {
        this.setState({
            showResultDialog : false
        })
        this.props.history.goBack()
    }

    render(){
        const { page,uploadSummary, file, isImported, modelName} = this.state
        const uploadStyle = page!=2? {display:'block'}:{display:'none'}
        const importStyle = page!=1? {display:'block'}:{display:'none'}
        const heading = page==1? `${modelName} - Select File` : "Preview"

        return(
            <Page>
            <PageHeader heading={heading}/>
            <PageBody>
              <Box>
                <BoxBody>
                    <div className="text-right">
                        <Button onClick={this.onClickCancel} color="danger">X</Button>{' '}
                    </div>
                    <div style={uploadStyle}>
                        <UploadWizard
                            uploadSummary={uploadSummary}
                            file = {file}
                            onChangeFile={this.onChangeFile}
                            onClickUpload={this.onClickUploadOrImport}
                            onClickNext={this.onClickNext}>
                        </UploadWizard>
                    </div>
                    <div style={importStyle}>
                        <ImportWizard
                            uploadSummary={uploadSummary}
                            onClickImport={this.onClickUploadOrImport}
                            onClickPrevious={this.onClickPrevious}
                            isImported = {isImported}>
                        </ImportWizard>
                    </div>
                </BoxBody>
                </Box>
                {this.getImportDetailsModal()}
            </PageBody>
            </Page>
        )
    }
}

export default withRouter((connect(mapStateToProps, mapDispatchToProps)) (ImportRecords))
