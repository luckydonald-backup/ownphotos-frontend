import React, {Component} from 'react';
import { connect } from "react-redux";
import {fetchPlaceAlbum, fetchAutoAlbums, generateAutoAlbums} from '../actions/albumsActions'
import {Container, Icon, Divider, Header, Image, Button, Flag, Card, Loader} from 'semantic-ui-react'
import { fetchPeople, fetchEgoGraph } from '../actions/peopleActions';
import { fetchPhotoDetail, fetchNoTimestampPhotoList} from '../actions/photosActions';

import {Server, serverAddress} from '../api_client/apiClient'
import { Grid, List, WindowScroller,AutoSizer } from 'react-virtualized';
import {EgoGraph} from '../components/egoGraph'
import { push } from 'react-router-redux'
import {countryNames} from '../util/countryNames'
import {AllPhotosMap, EventMap, LocationClusterMap, LocationMap} from '../components/maps'
import {LightBox} from '../components/lightBox'

import _ from 'lodash'
import moment from 'moment'
import {PhotoListView} from './ReusablePhotoListView'


var topMenuHeight = 55 // don't change this
var ESCAPE_KEY = 27;
var ENTER_KEY = 13;
var RIGHT_ARROW_KEY = 39;
var UP_ARROW_KEY = 38;
var LEFT_ARROW_KEY = 37;
var DOWN_ARROW_KEY = 40;

var SIDEBAR_WIDTH = 85;

var DAY_HEADER_HEIGHT = 70
var leftMenuWidth = 85 // don't change this




export class AlbumPlaceGallery extends Component {
    state = {
      photosGroupedByDate: [],
      idx2hash: [],
      albumID: null,
    }
  
    componentDidMount() {
        this.props.dispatch(fetchPlaceAlbum(this.props.match.params.albumID))
    }



  
  
  
    static getDerivedStateFromProps(nextProps,prevState){
        if (nextProps.albumsPlace.hasOwnProperty(nextProps.match.params.albumID)){
            const photos = nextProps.albumsPlace[nextProps.match.params.albumID].photos
            if (prevState.idx2hash.length != photos.length) {

                var t0 = performance.now();
                var groupedByDate = _.groupBy(photos,(el)=>{
                    if (el.exif_timestamp) {
                        return moment(el.exif_timestamp).format('YYYY-MM-DD')
                    } else {
                        return "No Timestamp"
                    }
                })
                var groupedByDateList = _.reverse(_.sortBy(_.toPairsIn(groupedByDate).map((el)=>{
                    return {date:el[0],photos:el[1]}
                }),(el)=>el.date))
                var idx2hash = []
                groupedByDateList.forEach((g)=>{
                    g.photos.forEach((p)=>{
                        idx2hash.push(p.image_hash)
                    })
                })
                var t1 = performance.now();
                console.log(t1-t0)
                return {
                    ...prevState, 
                    photosGroupedByDate: groupedByDateList,
                    idx2hash:idx2hash,
                    albumID:nextProps.match.params.albumID
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }
  
  
  
    render() {
      const {fetchingAlbumsPlace} = this.props
      return (
        <PhotoListView 
          title={this.props.albumsPlace[this.props.match.params.albumID] ? this.props.albumsPlace[this.props.match.params.albumID].title : "Loading... "}
          loading={fetchingAlbumsPlace}
          titleIconName={'map outline'}
          photosGroupedByDate={this.state.photosGroupedByDate}
          idx2hash={this.state.idx2hash}
        />
      )  
    }
  }







/*
export class AlbumPlaceGallery extends Component {
    state = {
      photosGroupedByDate: [],
      idx2hash: [],
      lightboxImageIndex: 1,
      lightboxShow:false,
      width:  window.innerWidth,
      height: window.innerHeight,
      entrySquareSize:200,
      showMap:false,
      gridHeight: window.innerHeight- topMenuHeight - 60,
      headerHeight: 60,
      currTopRenderedRowIdx:0,
      numEntrySquaresPerRow:2,
    }

  constructor() {
    super();
    this.listRef = React.createRef()
    this.calculateEntrySquareSize = this.calculateEntrySquareSize.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
    this.onPhotoClick = this.onPhotoClick.bind(this)
  }

  componentDidMount() {
    this.calculateEntrySquareSize();
    window.addEventListener("resize", this.calculateEntrySquareSize.bind(this));
    this.props.dispatch(fetchPlaceAlbum(this.props.match.params.albumID))
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.calculateEntrySquareSize.bind(this))
  }


  calculateEntrySquareSize() {
    if (window.innerWidth < 600) {
      var numEntrySquaresPerRow = 2
    } 
    else if (window.innerWidth < 800) {
      var numEntrySquaresPerRow = 4
    }
    else if (window.innerWidth < 1000) {
      var numEntrySquaresPerRow = 6
    }
    else if (window.innerWidth < 1200) {
      var numEntrySquaresPerRow = 8
    }
    else {
      var numEntrySquaresPerRow = 10
    }

    var columnWidth = window.innerWidth - SIDEBAR_WIDTH - 5 - 5 - 15

    var entrySquareSize = columnWidth / numEntrySquaresPerRow
    var numEntrySquaresPerRow = numEntrySquaresPerRow
    this.setState({
      width:  window.innerWidth,
      height: window.innerHeight,
      entrySquareSize:entrySquareSize,
      numEntrySquaresPerRow:numEntrySquaresPerRow
    })
    if (this.listRef.current) {
        this.listRef.current.recomputeRowHeights()
    }
  }

    onPhotoClick(hash) {
        this.setState({lightboxImageIndex:this.state.idx2hash.indexOf(hash),lightboxShow:true})
    }

    static getDerivedStateFromProps(nextProps,prevState){
      if (nextProps.albumsPlace.hasOwnProperty(nextProps.match.params.albumID)){
        const photos = nextProps.albumsPlace[nextProps.match.params.albumID].photos
        if (prevState.idx2hash.length != photos.length) {
            var groupedByDate = _.groupBy(photos,(el)=>{
                if (el.exif_timestamp) {
                    return moment(el.exif_timestamp).format('YYYY-MM-DD')
                } else {
                    return "No Timestamp"
                }
            })
            console.log(groupedByDate)
            var groupedByDateList = _.reverse(_.sortBy(_.toPairsIn(groupedByDate).map((el)=>{
                return {date:el[0],photos:el[1]}
            }),(el)=>el.date))

            var idx2hash = []
            groupedByDateList.forEach((g)=>{
                g.photos.forEach((p)=>{
                    idx2hash.push(p.image_hash)
                })
            })

            console.log(groupedByDateList)
            return {
                ...prevState, 
                photosGroupedByDate: groupedByDateList,
                idx2hash:idx2hash
            }
        } else {
          return null
        }
      } else {
        return null
      }
    }


    rowRenderer = ({index, isScrolling, key, style}) => {
        const {isScrollingFast} = this.state;
        var rowHeight = this.state.entrySquareSize * Math.ceil(this.state.photosGroupedByDate[index].photos.length/this.state.numEntrySquaresPerRow.toFixed(1)) + DAY_HEADER_HEIGHT
        if (isScrollingFast) {
            return (
                <div key={key} style={{...style,height:rowHeight}}>
                    <div style={{backgroundColor:'white'}}>
                    <DayGroupPlaceholder
                        key={index}
                        onPhotoClick={this.onPhotoClick}
                        day={this.state.photosGroupedByDate[index]} 
                        itemSize={this.state.entrySquareSize} 
                        numItemsPerRow={this.state.numEntrySquaresPerRow}/>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div key={key} style={{...style,height:rowHeight}}>
                    <div style={{backgroundColor:'white'}}>
                    <DayGroup 
                        key={index}
                        onPhotoClick={this.onPhotoClick}
                        day={this.state.photosGroupedByDate[index]} 
                        itemSize={this.state.entrySquareSize} 
                        numItemsPerRow={this.state.numEntrySquaresPerRow}/>
                    </div>
                </div>
            )        }
    }

    getRowHeight = ({index}) => {
        var rowHeight = this.state.entrySquareSize * Math.ceil(this.state.photosGroupedByDate[index].photos.length/this.state.numEntrySquaresPerRow.toFixed(1)) + DAY_HEADER_HEIGHT
        return (
            rowHeight
        )
    }


  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
      var photoIndex = rowIndex * this.state.numEntrySquaresPerRow + columnIndex
      if (photoIndex < this.props.albumsPlace[this.props.match.params.albumID].photos.length) {
      	var image_hash = this.props.albumsPlace[this.props.match.params.albumID].photos[photoIndex].image_hash
        return (
          <div key={key} style={style}>
            <div 
              onClick={()=>{
                this.onPhotoClick(photoIndex)
                console.log('clicked')
                // this.props.dispatch(push(`/person/${this.props.albumsPlace[this.props.match.params.albumID][photoIndex].key}`))
              }}>
              <Image 
              	height={this.state.entrySquareSize-5}
              	width={this.state.entrySquareSize-5}
              	src={serverAddress+'/media/square_thumbnails/'+image_hash+'.jpg'}/>

            </div>
          </div>
        )
      }
      else {
        return (
          <div key={key} style={style}>
          </div>
        )
      }
  }

  getPhotoDetails(image_hash) {
      if (!this.props.photoDetails.hasOwnProperty(image_hash)) {
          this.props.dispatch(fetchPhotoDetail(image_hash))
      }
  }

  render() {
    var entrySquareSize = this.state.entrySquareSize
    var numEntrySquaresPerRow = this.state.numEntrySquaresPerRow
    if (this.props.albumsPlace.hasOwnProperty(this.props.match.params.albumID)) {
      var totalListHeight = this.state.photosGroupedByDate.map((day,index)=>{
          return (
              this.getRowHeight({index})
          )
      }).reduce((a,b)=>(a+b),0)
	    return (
	      <div>

          <div style={{position:'fixed',top:topMenuHeight+10,right:10,float:'right'}}>
            <Button 
              active={this.state.showMap}
              color='blue'
              icon labelPosition='right'
              onClick={()=>{
                this.setState({
                  showMap: !this.state.showMap,
                  gridHeight: !this.state.showMap ? this.state.height - topMenuHeight - 260 : this.state.height - topMenuHeight - 60,
                  headerHeight: !this.state.showMap ? 260 : 60
                })}
              }
              floated='right'>
                <Icon name='map' inverted/>{this.state.showMap ? "Hide Map" : "Show Map"}
              </Button>
          </div>



	      	<div style={{height:this.state.headerHeight,paddingTop:10,paddingRight:5}}>


            <Header as='h2'>
              <Icon name='map pin' />
              <Header.Content>
                {this.props.albumsPlace[this.props.match.params.albumID].title} 
                {countryNames.includes(this.props.albumsPlace[this.props.match.params.albumID].title.toLowerCase()) && <Flag style={{paddingLeft:10}} name={this.props.albumsPlace[this.props.match.params.albumID].title.toLowerCase()}/>}
                <Header.Subheader>
          	      {this.props.albumsPlace[this.props.match.params.albumID].photos.length} Photos
                </Header.Subheader>
              </Header.Content>
            </Header>


          {this.state.showMap && <LocationMap zoom={4} photos={_.sampleSize(this.props.albumsPlace[this.props.match.params.albumID].photos,100)} height={200-20}/>}


	      	</div>
                    <List
                        ref={this.listRef}
                        style={{outline:'none',paddingRight:0,marginRight:0}}
                        onRowsRendered={({ overscanStartIndex, overscanStopIndex, startIndex, stopIndex })=>{
                            this.setState({currTopRenderedRowIdx:startIndex})
                        }}
                        height={this.state.gridHeight}
                        overscanRowCount={5}
                        rowCount={this.state.photosGroupedByDate.length}
                        rowHeight={this.getRowHeight}
                        rowRenderer={this.rowRenderer}
                        onScroll={this.handleScroll}
                        estimatedRowSize={totalListHeight/this.state.photosGroupedByDate.length.toFixed(10)}
                        width={this.state.width-leftMenuWidth-5}/>  

          { this.state.lightboxShow &&
              <LightBox
                  idx2hash={this.state.idx2hash}
                  lightboxImageIndex={this.state.lightboxImageIndex}

                  onCloseRequest={() => this.setState({ lightboxShow: false })}
                  onImageLoad={()=>{
                      this.getPhotoDetails(this.state.idx2hash[this.state.lightboxImageIndex])
                  }}
                  onMovePrevRequest={() => {
                      var nextIndex = (this.state.lightboxImageIndex + this.state.idx2hash.length - 1) % this.state.idx2hash.length
                      this.setState({
                          lightboxImageIndex:nextIndex
                      })
                      this.getPhotoDetails(this.state.idx2hash[nextIndex])
                  }}
                  onMoveNextRequest={() => {
                      var nextIndex = (this.state.lightboxImageIndex + this.state.idx2hash.length + 1) % this.state.idx2hash.length
                      this.setState({
                          lightboxImageIndex:nextIndex
                      })
                      this.getPhotoDetails(this.state.idx2hash[nextIndex])
                  }}/>
          }



				</div>
	    )
    }
    else {
    	return (
    		<div><Loader active/></div>
    	)
    }
  }
}
*/

AlbumPlaceGallery = connect((store)=>{
  return {
    albumsPlace: store.albums.albumsPlace,
    fetchingAlbumsPlace: store.albums.fetchingAlbumsPlace,
    fetchedAlbumsPlace: store.albums.fetchedAlbumsPlace,
    photoDetails: store.photos.photoDetails,
    fetchingPhotoDetail: store.photos.fetchingPhotoDetail,
    fetchedPhotoDetail: store.photos.fetchedPhotoDetail,
  }
})(AlbumPlaceGallery)
