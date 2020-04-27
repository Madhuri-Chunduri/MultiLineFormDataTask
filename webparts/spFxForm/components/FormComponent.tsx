import * as React from "react";
import { sp } from "sp-pnp-js";
import * as pnp from "sp-pnp-js";
import Linkify from 'react-linkify';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "./FormComponent.sass";
import { ISpFxFormProps } from "./ISpFxFormProps";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { initializeIcons } from '@uifabric/icons';
import DragAndDrop from "./DragAndDropComponent";

initializeIcons();

class FormComponent extends React.Component<ISpFxFormProps, any> {
  modules = {
    toolbar: {
      container: "#toolbar",
    }
  };

  private readonly inputOpenFileRef: React.RefObject<HTMLInputElement>

  constructor(props) {
    super(props);
    this.state = {
      title: "", description: "",
      files: [],
      errors: { title: "*" },
      validationMessage: ""
    };
    this.handleTitle = this.handleTitle.bind(this);
    this.handleText = this.handleText.bind(this);
    this.submitDetails = this.submitDetails.bind(this);
    this.inputOpenFileRef = React.createRef()
  }

  handleTitle = (event) => {
    let errors = this.state.errors;
    const target = event.target;
    const fieldName = target.name;
    this.setState({ [fieldName]: event.target.value });
    if (event.target.value.length == 0) {
      errors.title = "* Title cannot be empty";
    }
    else errors.title = "";
    this.setState({ errors: errors });
  }

  handleText = (event) => {
    this.setState({ description: event });
  }

  onInsertFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var fileCount = event.target.files.length;
    var file = event.target.files[0];
    var url = "/SiteAssets/Lists/FormDataList/NewForm";
    pnp.setup({
      spfxContext: this.props.context
    });

    sp.web.getFolderByServerRelativeUrl(this.props.context.pageContext.web.serverRelativeUrl + url)
      .files.add(file.name, file, true)
      .then((data) => {
        var fileType: string = file.type;
        var description: string;
        var finalDescription: string;
        if (fileType.substring(0, 5) == "image") {
          description = this.state.description +
            "<img src= '" + this.props.context.pageContext.web.serverRelativeUrl + url + "/" + file.name + "' /> ";
          finalDescription = this.state.finalDescription +
            "<a href=" + this.props.context.pageContext.web.serverRelativeUrl + url + "/" + file.name + "> " + file.name + "</a>";
        }
        else description = this.state.description +
          "<a href=" + this.props.context.pageContext.web.serverRelativeUrl + url + "/" + file.name + "> " + file.name + "</a>";
        this.setState({ description: description });
      })
      .catch((error) => {
        console.log("Error ", error);
        alert("Error in uploading");
      });
  }


  handleDrop = (files) => {
    let fileList = this.state.files
    for (var i = 0; i < files.length; i++) {
      if (!files[i].name) return
      fileList.push(files[i])
    }
    this.setState({ files: fileList })
  }

  submitDetails() {
    let count = 0;
    let errors = this.state.errors;

    Object.keys(errors).forEach((key: any) => {
      if (errors[key].length > 0) count += 1;
    });

    if (count > 0) {
      this.setState({
        validationMessage: "* Please fill the below fields with valid data",
        errors: errors,
      });
      return false;
    }

    else {
      pnp.setup({
        spfxContext: this.props.context
      });

      return sp.web.lists
        .getByTitle("FormDataList")
        .items.add({
          "Title": this.state.title,
          "FormData": this.state.description
        }).then(
          async (result) => {
            let attachments = []
            this.state.files.forEach(file => {
              attachments.push({
                name: file.name,
                content: file
              })
            }
            );
            result.item.attachmentFiles.addMultiple(attachments).then(function () {
              this.setState({ title: "", description: "", errors: { title: "*" }, files: [] });
            });
          }
        )
    }
  }

  render() {
    let errors = this.state.errors;

    return (
      <div className="formBody">
        <div className="validationMessage">{this.state.validationMessage}</div>
        <div className="label">
          <p> Title
            {errors.title.length > 0 ? <span className="error">{errors.title}</span> : ""}
          </p>
        </div>
        <input type="text" name="title" className="inputTextField" onChange={this.handleTitle} value={this.state.title} />
        <div className="label">
          <p> Description </p>
        </div>
        <div className="quillBox">
          <CustomToolbar reference={this.inputOpenFileRef} />
          <ReactQuill value={this.state.description} onChange={this.handleText} modules={this.modules}
          />
        </div>
        <DragAndDrop handleDrop={this.handleDrop}>
          <div className="dropBox">
          </div>
        </DragAndDrop>
        {this.state.files.length > 0 ? <h2> Uploaded files : </h2> : ""}
        {this.state.files.map((file) =>
          <div>{file.name}</div>
        )}
        {/* <Linkify><TextField name="description" value={this.state.description} rows={10} /></Linkify> */}
        <input type="file" ref={this.inputOpenFileRef} style={{ display: "none" }} />
        {/* <input type="button" onClick={() => this.inputOpenFileRef.current.click()} value="Add file" /> */}
        <input type="submit" className="submitButton" value="Submit Form" onClick={this.submitDetails} />
      </div>
    );
  }
}

export default FormComponent;

class CustomToolbar extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="toolbar">
        <select className="ql-color" />
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-clean" />
        <button className="ql-link" />
        {/* <button className="ql-insertAttach" onClick={() => this.props.reference.current.click()}>
          <span><Icon iconName="Attach" /></span>
        </button> */}
      </div>
    )
  }
};
