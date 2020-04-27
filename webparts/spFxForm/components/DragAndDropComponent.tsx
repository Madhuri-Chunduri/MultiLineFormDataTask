import * as React from 'react';

class DragAndDrop extends React.Component<any, any> {
    private readonly dropRef: React.RefObject<HTMLInputElement>
    private readonly inputOutputRef: React.RefObject<HTMLInputElement>

    constructor(props) {
        super(props);
        this.state = {
            drag: true
        }
        this.dropRef = React.createRef();
        this.inputOutputRef = React.createRef();
        this.testClick = this.testClick.bind(this);
    }

    handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    handleDragIn = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragCounter++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({ drag: true })
        }
    }

    handleDragOut = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragCounter--
        if (this.dragCounter === 0) {
            this.setState({ drag: false })
        }
    }

    handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.setState({ drag: false })
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            console.log("Target Result : ", e.target.result);
            this.props.handleDrop(e.dataTransfer.files)
            e.dataTransfer.clearData()
            this.dragCounter = 0
        }
    }

    dragCounter: any
    componentDidMount() {
        let div = this.dropRef.current
        div.addEventListener('dragenter', this.handleDragIn)
        div.addEventListener('dragleave', this.handleDragOut)
        div.addEventListener('dragover', this.handleDrag)
        div.addEventListener('drop', this.handleDrop)
    }
    componentWillUnmount() {
        let div = this.dropRef.current
        div.removeEventListener('dragenter', this.handleDragIn)
        div.removeEventListener('dragleave', this.handleDragOut)
        div.removeEventListener('dragover', this.handleDrag)
        div.removeEventListener('drop', this.handleDrop)
    }

    testClick() {
        console.log("Click successful");
        this.inputOutputRef.current.click();
    }

    render() {
        return (
            <div>
                <input type="file" ref={this.inputOutputRef} style={{ display: "none" }} />
                <div ref={this.dropRef} onClick={this.testClick}>
                    <div className="dropBoxContent">Drag and drop your files here</div>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
export default DragAndDrop