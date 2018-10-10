import React from 'react'
import { themeSettings, text } from '../../lib/settings'
import CustomProducts from '../products/custom'
import moment from 'moment'
const Fragment = React.Fragment;

const Item = ({star, value, percent}) => {
    return (
        <li>
            <div className="columns">
              <div className="column is-1" style={{textAlign: 'right'}}>{star} star</div>
              <div className="column is-2">
                <div className="stat-levels">
                  <div className="stat-1 stat-bar">
                    <span className="stat-bar-rating" role="stat-bar" style={{width: percent}}></span>
                  </div>
                </div>
              </div>
              <div className="column is-1">{percent}</div>
            </div>
        </li>
    )
}

const StarView = ({star}) => {
    const stars = [1,2,3,4,5].map(id => {
       const starStyle = star >= id ? 'fa fa-star checked' : 'fa fa-star';
       return (
         <span key={id} className={starStyle}></span>
       )
     }
   )
   return (
      <div>{stars}</div>
   )
}

const Review = ({full_name, star, date, title, content}) => {
    return (
        <li>
            <div>{full_name}</div>
            <div className="columns" style={{marginBottom: '0px', marginTop: '5px'}}>
              <div className="column is-1">
                <StarView star={star} />
              </div>
              <div className="column is-11">
                <strong>{title}</strong>
              </div>
            </div>
            <div className="review-date">{date}</div>
            <div style={{whiteSpace: 'pre-line'}}>{content}</div>
            <hr />
        </li>
    )
}

export default class CustomerReviews extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { settings, rates, reviews } = this.props;

    let title = themeSettings.customerReviews_title && themeSettings.customerReviews_title.length > 0
      ? themeSettings.customerReviews_title
      : text.customerReviews;
    let rateView = null;
    var id = 5;
    if (rates && rates.length > 0){
        var total = 0;
        var temp = 0;
        var average = 0;
        rates.forEach(rate => {
            temp = temp + (rate.value * rate.star);
            total = total + rate.value;
        })
        average = (temp/total).toFixed(1);
        rates.forEach(rate => {
            var percent = total > 0 ? Math.round((rate.value * 100)/total) : 0;
            rate.star = rate.star.toString();
            rate.percent = percent + '%';
            rate.id = id;
            id -= 1;
        })
        const reverse = rates.reverse();
        rateView = reverse.map(rate => (
            <Item key={rate.id} star={rate.star} value={rate.value} percent={rate.percent}/>
        ));
    }

    let reviewView = null;
    if (reviews && reviews.length > 0){
        reviews.sort((a,b) => a.star < b.star);
        reviewView = reviews.map(review => {
            let dateReview = moment(review.date_reviewed);
            let date = dateReview.format(`${settings.date_format}`);
            return  (<Review key={review.id} full_name={review.full_name} star={review.star} date={date} title={review.title} content={review.content} />)
        })
    }

    return (
      <section className="section section-product-related section-gray">
        <div className="container border-section">
          <div className="title-section is-4 has-text-centered">{title}</div>

          <ul style={{padding: '30px', color: '#0066c0'}}>
            <li style={{paddingBottom: '10px'}}>{average} out of 5 stars</li>
            {rateView}
          </ul>
          <div className="title is-4" style={{paddingLeft: '25px', margin: '0px'}}>Top Customer Reviews</div>
          <ul style={{padding: '30px', color: '#111'}}>
            {reviewView}
          </ul>
        </div>
      </section>
    )
  }
}
