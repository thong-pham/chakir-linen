import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

class ReviewProduct extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        mobileMenuIsActive: false,
        mobileSearchIsActive: false,
        checked: null,
        title: '',
        content: '',
        checkedError: null,
        titleError: null,
        contentError: null
      }
   }

   componentDidMount(){
       if (localStorage.getItem('token') === null){
           this.props.history.push('/login');
       }
   }


   checkStar = (id) => {
      if (id !== this.state.checked){
          this.setState({checked: id});
      }
      else {
          this.setState({checked: null});
      }
   }

   onSubmit = () => {
        const { title, content, checked } = this.state;
        const { reviewItem } = this.props.state;
        var done = true;
        if (checked === null){
            this.setState({checkedError: 'Please choose your rating'})
            done = false;
        }
        else {
             this.setState({checkedError: null});
        }

        if (content === null || (content + "").trim() === ""){
             this.setState({contentError: 'Review cannot be empty'})
            done = false;
        }
        else {
             this.setState({contentError: null});
        }

        if (title === null || (title + "").trim() === ""){
            this.setState({titleError: 'Title cannot be empty'})
            done = false;
        }
        else {
              this.setState({titleError: null});
        }

        if (done){
            const data = {
                productId: reviewItem.product_id,
                title,
                content,
                star: checked
            }
            this.props.addReview(data);
        }
   }

   render(){

       const { location } = this.props.state;
       const { checked, title, content, checkedError, titleError, contentError } = this.state;

       const stars = [1,2,3,4,5].map(id => {
          const starStyle = checked >= id ? 'fa fa-star star-font checked' : 'fa fa-star star-font';
          return (
            <span key={id} className={starStyle} onClick={() => this.checkStar(id)}></span>
          )
        }
      )

      let checkedErrorView = null;
      let titleErrorView = null;
      let contentErrorView = null;

      if (checkedError){
          checkedErrorView = (<div className="error-box">{checkedError}</div>)
      }

      if (titleError){
          titleErrorView = (<div className="error-box">{titleError}</div>)
      }

      if (contentError){
          contentErrorView = (<div className="error-box">{contentError}</div>)
      }

       return (
                <div className="column is-6 is-offset-3 review-box">
                    <h3>Overall rating</h3>
                    {stars}
                    {checkedErrorView}
                    <hr />
                    <div className="info-field">
                      <label>Title</label>
                      <input type="text" value={title} placeholder='Enter your review headline' onChange={(e) => this.setState({title: e.target.value})}/>
                      {titleErrorView}
                    </div>
                    <hr />
                    <div className="info-field">
                      <label>Review</label>
                      <textarea type="text" value={content} placeholder='How do you think about the product ?' onChange={(e) => this.setState({content: e.target.value})}/>
                      {contentErrorView}
                    </div>
                    <hr />
                    <div style={{textAlign: 'right'}}>
                      <button type="button" className="button is-success" onClick={this.onSubmit}>Submit</button>
                    </div>
                </div>
         )
    }
}

export default ReviewProduct
