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

initializeIcons();
const formats = ["header", "font", "size", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "indent", "link", "image", "color"];
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);

const Font = Quill.import("formats/font");
Font.whitelist = ["arial", "comic-sans", "courier-new", "georgia", "helvetica", "lucida"];
Quill.register(Font, true);

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
        if (fileType.substring(0, 5) == "image") {
          description = this.state.description +
            "<img src= '" + this.props.context.pageContext.web.serverRelativeUrl + url + "/" + file.name + "' /> ";
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
          (result) => {
            if (result.data.Id > 0) {
              //window.location.reload();
              this.setState({ title: "", description: "", errors: { title: "*" } });
            }
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
        <CustomToolbar reference={this.inputOpenFileRef} />
        <ReactQuill value={this.state.description} onChange={this.handleText} modules={this.modules}
          formats={formats} />
        {/* <Linkify><TextField name="description" value={this.state.description} rows={10} /></Linkify> */}
        <input ref={this.inputOpenFileRef} type="file" style={{ display: "none" }} onChange={this.onInsertFile.bind(this)} />
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
        <select className="ql-font">
          <option value="arial" selected> Arial </option>
          <option value="comic-sans">Comic Sans</option>
          <option value="courier-new">Courier New</option>
          <option value="georgia">Georgia</option>
          <option value="helvetica">Helvetica</option>
          <option value="lucida">Lucida</option>
        </select>
        <select className="ql-size">
          <option value="extra-small">Size 1</option>
          <option value="small">Size 2</option>
          <option value="medium" selected> Size 3 </option>
          <option value="large">Size 4</option>
        </select>
        <select className="ql-align" />
        <select className="ql-color" />
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-clean" />
        <button className="ql-link" />
        <button className="ql-insertAttach" onClick={() => this.props.reference.current.click()}>
          <span><Icon iconName="Attach" /></span>
        </button>
      </div>
    )
  }
};
