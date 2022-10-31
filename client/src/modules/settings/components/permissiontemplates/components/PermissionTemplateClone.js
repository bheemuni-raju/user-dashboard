import React,{Component} from 'react'
import PermissionTemplateForm from './PermissionTemplateForm'

class PermissionTemplateClone extends Component{
    render(){
        return (
            <PermissionTemplateForm clonedTemplateId={this.props.match.params.templateId}/>
        )
    }
}

export default PermissionTemplateClone