import {batchActions} from "redux-batched-actions";
import {changeDate} from "./date";

export const loadArticles = (articles) => {
    return {
        type: 'LOAD_ARTICLES',
        articles: articles
    }
};

export const fetchArticles = (date) => {
    return (dispatch) => {
        fetch(date.format('[/day?year=]YYYY[&month=]MM[&day=]DD'))
            .then(data => data.json())
            .then(paragraphs => dispatch(batchActions([
                loadArticles(paragraphs),
                changeDate(date)
            ])))
    }
};