import React, { Component } from 'react'
import ByjusComboBox from "../combobox/ByjusComboBox";
import Notify from "react-s-alert";
import { connect } from 'react-redux'
import { getFavouriteFilter } from "../favouriteSearch/FavouriteSearch";

const mapStateToProps = state => ({
  user: state.auth.user
})

class FavouriteSearchComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
        favouriteFilter: [], 
        searchCriteriasOptions: []
    }
  }

  /** Favourite Filter List if GridId Exists */
  refreshFavouriteFilter = async() => {
    const { gridId, user } = this.props;
    const emailId = user.email
    if (gridId && gridId!= undefined) {
      const favouriteFilterResponse = await getFavouriteFilter(gridId, emailId)
      this.setState({favouriteFilter: favouriteFilterResponse.favouriteFilter, searchCriteriasOptions: favouriteFilterResponse.searchCriteriasOptions})
    }
  }

  componentDidMount = async () => {
    this.refreshFavouriteFilter()
  }
  /** Search Criteria changes onChnage of Favourite Filter options**/
  onChangeFavouriteFilter = (name,selectedValue) =>{
    const { searchCriteriasOptions } = this.state
    searchCriteriasOptions.map(async(ls) => {
      if (ls.formattedName === selectedValue.value) {
        const query = ls.query
        const searchQueryList = []
        query.map((optn) => {
          const searchQueryDict = {
            selectedColumn: optn.selectedColumn.dataField,
            selectedOperator: optn.selectedOperator.value,
            selectedValue: optn.selectedValue.value
          }
          searchQueryList.push(searchQueryDict)
        })
        const buildSearchCriteria = {
          conditionType: "$or",
          searchBuilder: searchQueryList
        }
        const nextState = { ...this.state, searchCriterias: buildSearchCriteria };
        this.props.loadData(nextState);
      }
    })
    this.setState({
      [name]:selectedValue,
    });
  }

  componentWillReceiveProps = (nextProps,nextState) => {
    const {isAdvanceSearchApplied, isFavouriteFilterUpdated, clearFavouriteFilter} = nextProps;
    /***Clear Favorite selection on clearing advance search */
    if(!isAdvanceSearchApplied){
        this.setState({selectedQuickFilter:""});
    }
    if(isFavouriteFilterUpdated) {
      this.refreshFavouriteFilter()
    }
  } 

  render() {
       const {favouriteFilter,selectedQuickFilter} = this.state;
       return ( 
          <ByjusComboBox
              name='selectedQuickFilter'
              placeholder='Select Favourite Filter'
              value={selectedQuickFilter||''}
              options={favouriteFilter}
              onChange={this.onChangeFavouriteFilter}
          />
        )
    }
}

export default connect(mapStateToProps,null, null, {forwardRef : true})(FavouriteSearchComponent);
