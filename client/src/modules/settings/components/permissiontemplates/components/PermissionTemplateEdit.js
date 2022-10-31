import React,{Component} from 'react'
import PermissionTemplateForm from './PermissionTemplateForm'

class PermissionTemplateEdit extends Component{
    render(){
        return (
            <PermissionTemplateForm templateId={this.props.match.params.templateId}/>
        )
    }
}

export default PermissionTemplateEdit