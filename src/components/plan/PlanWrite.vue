<template>
  <div class="mb-3">
    <div class="container">
      <div class="mt-5 mb-5" style="color: black">
        <h1 class="fourth"><span>MY </span><span>PLAN</span></h1>
      </div>
      <div class="map-area">
        <div class="searchbox rounded">
          <div class="d-flex flex-row justify-content-center">
            <input
              id="search-keyword"
              class="col-7 form-control m-2"
              type="text"
              placeholder="검색어를 입력하세요!"
              aria-label="검색어"
              v-model="search.keyword"
              @keyup.enter="searchPlace()"
            />
            <button
              id="btn-search"
              class="btn submit-btn col-3 m-2"
              style="border: 1px solid #c1c1c1"
              type="button"
              @click="searchPlace()"
            >
              검색
            </button>
          </div>
          <div class="results">
            <div
              class="place d-flex justify-content-between"
              v-for="rs in search.results"
              :key="rs.id"
              @click="showPlace(rs)"
            >
              <!-- <img :src="rs.imageUrl" :alt="rs.place_name" style="width: 4em; height: 4em" /> -->
              <div class="col-8">
                <Strong>{{ rs.place_name }}</Strong>
                <div class="addr">{{ rs.address_name }}</div>
              </div>
              <div>
                <b-icon
                  class="col-3"
                  icon="plus-square-fill"
                  variant="primary"
                  @click="addPlace(rs)"
                ></b-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- map이 들어갈 위치 -->
      <!-- kakao map start -->
      <div id="map" ref="map" class="shadow rounded"></div>
      <!-- kakao map end -->
      <div>
        <!-- 여행 계획 들어가는 영역 -->
        <div class="d-flex flex-column p-2 mt-5" style="width: 100%; height: 20em">
          <h3 id="plan-title" class="text-center p-2"><strong>여행 계획</strong></h3>
          <div>
            <div
              id="plan-content"
              class="rounded bg-light shadow mb-2 mx-auto p-2 overflow-auto d-flex justify-content-center"
              style="width: 100%; height: 10em"
            >
              <draggable
                v-model="places"
                @change="changePlaceList()"
                class="d-flex flex-row plan-content"
              >
                <div v-for="(place, index) in places" :key="index" class="border rounded">
                  <b-row align-h="end">
                    <b-icon
                      class="col-3"
                      icon="dash-square-fill"
                      variant="danger"
                      @click="deletePlace(place.placeId)"
                    ></b-icon>
                  </b-row>
                  <div class="text-center p-2">
                    <div class="place-title">{{ place.name }}</div>
                    <div>{{ place.address }}</div>
                  </div>
                </div>
              </draggable>
            </div>
          </div>
        </div>
        <div id="plan-detail" class="d-flex flex-column align-items-center rounded mx-auto">
          <label for="name"><strong>제목</strong></label>
          <input
            type="text"
            name="title"
            id="title"
            v-model="plan.title"
            placeholder="계획 이름"
            class="plan-detail-content align-middle ms-2 mt-2 rounded shadow border-light-subtle p-2"
            style="width: 70%"
          />
          <br />
          <div
            class="plan-detail-date d-flex flex-row justify-content-around mb-3"
            style="width: 70%"
          >
            <div>
              <label for="start_datepicker" class="mx-4"><strong>출발일</strong></label>
              <input
                type="date"
                name="startDate"
                v-model="plan.startDate"
                id="start_datepicker"
                placeholder="년도-월-일"
                style="width: 8em; height: 1.8em"
                class="plan-detail-content plan-detail-start ms-2 me-2 align-middle rounded shadow border-light-subtle p-2"
              />
            </div>
            <div>
              <label for="end_datepicker" class="mx-4"><strong>도착일</strong></label>
              <input
                type="date"
                name="endDate"
                v-model="plan.endDate"
                id="end_datepicker"
                placeholder="년도-월-일"
                style="width: 8em; height: 1.8em"
                class="plan-detail-content plan-detail-end ms-2 me-2 align-middle rounded shadow border-light-subtle p-2"
              />
            </div>
          </div>
          <label for="description"><strong>상세 계획</strong></label>
          <textarea
            name="description"
            v-model="plan.description"
            id="description"
            placeholder="상세 계획을 적어보자!"
            class="plan-detail-content align-middle ms-2 mt-2 rounded shadow border-light-subtle p-2"
            style="width: 70%; height: 10em"
          ></textarea>
          <br />
          <button
            class="button btnFloat btnBlueGreen"
            id="plan-save-btn"
            style="top: 5px; left: 120px"
            type="button"
            @click="registPlan"
          >
            <strong>저장</strong>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
// import { attrImageInstance } from "@/api/index";
import axios from "axios";
import draggable from "vuedraggable";

// const http = attrImageInstance();

const userStore = "userStore";
const planStore = "planStore";
const attractionStore = "attractionStore";

export default {
  name: "PlanWrite",
  components: {
    draggable,
  },
  computed: {
    ...mapState(planStore, ["isRegist"]),
    ...mapState(userStore, ["userInfo"]),
  },
  /*
    [마커 데이터 정보]
    address_name
    category_group_code
    category_group_name
    category_name
    distance
    id
    phone
    place_name
    place_url
    road_address_name
*/
  data() {
    return {
      plan: {
        id: null,
        title: null,
        description: null,
        createdAt: null,
        updatedAt: null,
        startDate: null,
        endDate: null,
        userId: null,
        hit: null,
      },
      search: {
        keyword: null,
        pgn: null,
        results: [],
      },
      map: null,
      // 마커
      markers: [], // 마커 객체 담는 배열
      planMarkers: [], // 계획에 포함된 마커 객체 담는 배열
      // 오버레이
      overlays: [], // 오버레이 담는 배열
      // 선그리기
      drawingFlag: false,
      clickLine: null,
      clickLines: [],
      dots: [],
      addVal: null,
      places: [],
      isAddFlag: false, // 검색한 여행지 추가 후 타이틀을 선택했는지 판단하는 flag
      attrImage: null, // 관광지 이미지 정보
    };
  },
  mounted() {
    if (window.kakao && window.kakao.maps) {
      this.loadMap();
    } else {
      this.loadScript();
    }
  },
  watch: {
    "search.results": {
      handler() {
        if (this.search.results.length > 0) {
          this.loadMaker(this.search.results);
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapMutations(attractionStore, ["CLEAR_POSITION_LIST"]),
    ...mapActions(planStore, ["planRegist"]),
    ////////////////////// 지도 불러오기 start //////////////////////
    // api 불러오기
    loadScript() {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${process.env.VUE_APP_KAKAOMAP_KEY}&libraries=services`;
      script.onload = () => {
        this.CLEAR_POSITION_LIST();
        window.kakao.maps.load(this.loadMap);
      };

      document.head.appendChild(script);
    },
    // 맵 출력하기
    loadMap() {
      const container = this.$refs.map;
      const options = {
        center: new window.kakao.maps.LatLng(37.500613, 127.036431),
        level: 8,
      };

      this.map = new window.kakao.maps.Map(container, options);
      // if (this.positions.length > 0) this.loadMaker(this.positions);
    },
    ////////////////////// 지도 불러오기 end //////////////////////

    ////////////////////// 검색하기 start //////////////////////
    // 장소 검색하는 메소드
    searchPlace() {
      this.isAddFlag = false;
      const keyword = this.search.keyword;
      if (keyword === null || keyword.length === 0) {
        return;
      }
      // 결과값 초기화
      this.search.keyword = null;
      this.search.pgn = null;
      this.search.results = [];

      const ps = new window.kakao.maps.services.Places();

      // 키워드로 장소를 검색합니다
      ps.keywordSearch(keyword, async (data, status, pgn) => {
        this.search.keyword = keyword;
        this.search.pgn = pgn;
        this.search.results = data;
        // console.log(data);
        // console.log("check");
        for (let i = 0; i < this.search.results.length; i++) {
          // console.log("place_name:: " + this.search.results[i].place_name);
          await this.getImg(this.search.results[i].place_name);
          // this.search.results[i].imageUrl = this.attrImage;
        }
      });

      // console.log("EE");
      // console.log(this.search.results);

      this.map.setLevel(8);
    },
    // 검색한 관광지를 지도에 띄우는 메소드
    showPlace(rs) {
      // rs : 관광지 정보

      // 여행지를 추가한 후에 다시 타이틀을 클릭한 거라면 해당 마크 보여주기
      if (this.isAddFlag) {
        const imageSrc = require("@/assets/img/icon/location.png"); // 마커 이미지의 이미지 주소

        var imageSize = new window.kakao.maps.Size(30, 35); // 마커 이미지의 이미지 크기
        var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성

        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(rs.y, rs.x), // 마커를 표시할 위치
          title: rs.id, // a마커의 타이틀, 마커의 장소 id 넣기
          image: markerImage, // 마커 이미지
        });
        // 마커가 지도 위에 표시되도록 설정
        marker.setMap(this.map);

        this.markers.push(marker);

        // 마커에 클릭 이벤트 등록
        window.kakao.maps.event.addListener(marker, "click", () => {
          this.overlays.forEach((overlay) => {
            overlay.setMap(null);
          });
          this.displayCustomOverlay(rs);
        });
      }

      this.map.setCenter(new window.kakao.maps.LatLng(rs.y, rs.x));
      this.map.setLevel(5);

      // 열려져 있던 오버레이 다 닫기
      this.overlays.forEach((overlay) => {
        // console.log(overlay)
        overlay.setMap(null);
      });
      this.overlays = [];

      this.displayCustomOverlay(rs);
    },
    ////////////////////// 검색하기 end //////////////////////

    ////////////////////// 마커 그리기 start //////////////////////
    // 지정한 위치에 마커 불러오기
    loadMaker(positions) {
      const imageSrc = require("@/assets/img/icon/location.png"); // 마커 이미지의 이미지 주소

      // 이전에 추가된 마커들 제거
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers = [];

      for (let i = 0; i < positions.length; i++) {
        // console.log(positions[i]);
        var imageSize = new window.kakao.maps.Size(30, 35); // 마커 이미지의 이미지 크기
        var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성

        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(positions[i].y, positions[i].x), // 마커를 표시할 위치
          title: positions[i].id, // a마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시
          image: markerImage, // 마커 이미지
        });

        // 마커가 지도 위에 표시되도록 설정
        marker.setMap(this.map);

        this.markers.push(marker);

        // 마커에 클릭 이벤트 등록
        window.kakao.maps.event.addListener(marker, "click", () => {
          // this.makeMapUrl(positions[i]);
          this.overlays.forEach((overlay) => {
            overlay.setMap(null);
          });
          this.displayCustomOverlay(positions[i]);
        });
      }

      this.map.setCenter(new window.kakao.maps.LatLng(positions[0].y, positions[0].x));
    },
    // 마커 삭제하기
    deleteMarker(lat, lng, data) {
      this.markers.forEach((marker) => {
        if (
          marker.getPosition().getLat().toFixed(13) === lat &&
          marker.getPosition().getLng().toFixed(13) === lng
        ) {
          if (this.planMarkers) {
            const markerData = {
              marker: marker,
              placeId: data.id,
            };
            this.planMarkers.push(markerData);
            // console.log(this.planMarkers);
          }
        } else {
          // 검색했을 때 뜨는 마커들 삭제 : flag = false
          let planFlag = false;

          for (let i = 0; i < this.planMarkers.length; i++) {
            if (
              this.planMarkers[i].marker.getTitle() === marker.getTitle() &&
              this.planMarkers[i].marker.getPosition().getLat().toFixed(13) ===
                marker.getPosition().getLat().toFixed(13) &&
              this.planMarkers[i].marker.getPosition().getLng().toFixed(13) ===
                marker.getPosition().getLng().toFixed(13)
            ) {
              planFlag = true;
              break;
            }
          }
          if (!planFlag) {
            marker.setMap(null);
          }
        }
      });
    },
    ////////////////////// 마커 그리기 end //////////////////////

    ////////////////////// 커스텀 오버레이 start //////////////////////
    //커스텀 오버레이 표시 함수
    async displayCustomOverlay(marker) {
      // 관광지 이미지 정보 불러오기
      var image = this.attrImage;
      await this.getImg(marker.place_name);
      image = this.attrImage;

      let content = `
		<div class="wrap">
			<div class="info">
				<div class="title">
					${marker.place_name}
					<div class="close" @click="closeOverlay()" title="닫기"></div>
				</div>
				<div class="body">
					<div class="img">
						<img src="${image}" width="73" height="70">
					</div>
					<div class="desc">
						<div class="ellipsis mb-1">${marker.address_name}</div>
						<div class="mt-1">`;

      content += `<a href="https://map.kakao.com/link/to/${marker.place_name},${marker.y},${marker.x}" target="_blank" class="me-2" style="color: black; text-decoration: none;"><i class="tourist-icon bi bi-sign-turn-right me-1"></i>길찾기</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

      var overlay = new window.kakao.maps.CustomOverlay({
        content: content,
        position: new window.kakao.maps.LatLng(marker.y, marker.x),
      });

      overlay.setMap(this.map);

      this.overlays.push(overlay);
    },
    // 커스텀 오버레이를 닫는 함수
    closeOverlay() {
      this.overlays.forEach((overlay) => {
        // console.log(overlay)
        overlay.setMap(null);
      });
      this.overlays = [];
    },
    ////////////////////// 커스텀 오버레이 end //////////////////////

    ////////////////////// 선 그리기 start //////////////////////
    // 지도에 선 그리는 메소드
    drawLine(position, flag) {
      // flag: true(관광지 정보 그대로 받아들일 때 : data(x,y)), false(this.places 타입  (lat, lng))
      var clickPosition = null;
      if (!flag) {
        clickPosition = new window.kakao.maps.LatLng(position.y, position.x);
      } else {
        clickPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
      }

      if (!this.drawingFlag) {
        this.drawingFlag = true;

        this.clickLine = new window.kakao.maps.Polyline({
          map: this.map,
          path: [clickPosition],
          strokeWeight: 3,
          strokeColor: "#db4040",
          strokeOpacity: 1,
          strokeStyle: "solid",
        });
      } else {
        var path = this.clickLine.getPath();

        path.push(clickPosition);

        this.clickLine.setPath(path);

        var distance = Math.round(this.clickLine.getLength());
        console.log("distance : " + distance);
      }
    },
    // 선 삭제하기
    deleteLine() {
      if (this.clickLine) {
        this.clickLine.setMap(null);
        this.clickLine = null;
      }
    },
    ////////////////////// 선 그리기 end //////////////////////

    ////////////////////// 관광지를 여행계획에 넣기 start //////////////////////
    addPlace(data) {
      this.isAddFlag = true;
      this.drawLine(data, false);

      for (let i = 0; i < this.places.length; i++) {
        if (this.places[i].placeId === data.id) {
          return;
        }
      }

      const placeData = {
        placeId: data.id,
        name: data.place_name,
        address: data.address_name,
        lat: data.y,
        lng: data.x,
        // imageUrl: data.imageUrl,
      };
      this.places.push(placeData);

      // console.log(" data :: ");
      // console.log(placeData);

      // 선택된 애를 제외하고 마크 삭제
      let lat = (data.y * 1).toFixed(13);
      let lng = (data.x * 1).toFixed(13);

      this.deleteMarker(lat, lng, data);
    },
    // 추가된 관광지 삭제
    deletePlace(placeId) {
      this.places = this.places.filter((place) => place.placeId !== placeId);

      // 마커 삭제
      let lat = (this.places.lat * 1).toFixed(13);
      let lng = (this.places.lng * 1).toFixed(13);

      this.planMarkers = this.planMarkers.filter((marker) => marker.placeId !== placeId);

      this.deleteMarker(lat, lng, this.places);

      // 그려진 선 삭제
      this.deleteLine();

      this.drawingFlag = false;

      // 선 다시 그리기
      console.log("drawing :: ");
      this.places.forEach((place) => {
        this.drawLine(place, true);
      });
    },
    ////////////////////// 관광지를 여행계획에 넣기 end //////////////////////

    ////////////////////// 관광지 이미지 가져오기 start //////////////////////
    async getImg(title) {
      console.log(title);
      // getAttrImg(
      //   title,
      //   ({ data }) => {
      //     console.log("image data :: ");
      //     console.log(data);
      //     if (data.response === "undefined") {
      //       console.log(data.response);
      //       this.attrImage = require("@/assets/img/noimage.png");
      //     } else {
      //       console.log(data.response.body.items.item.galWebImageUrl);
      //       this.attrImage = data.response.body.items.item.galWebImageUrl;
      //     }
      //   },
      //   (error) => {
      //     this.attrImage = require("@/assets/img/noimage.png");
      //     console.log(error);
      //   }
      // );
      const encode = encodeURI(title);
      // const SERVICE_KEY = process.env.VUE_APP_TRIP_API_KEY;
      // `${SERVICE_KEY}&keyword=${encode}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&arrange=A&_type=json`
      await axios
        .get(
          `https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?serviceKey=wRLehfal1iPUgU5lXebqFzRhzIiCoN%2B%2FiJxmXuf2GQy4b6eK9SxyBpjfC6%2FnQuwQbakh6HgE%2BNpykN%2B691jFUw%3D%3D&keyword=${encode}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&arrange=A&_type=json`
        )
        .then(({ data }) => {
          // console.log(data);
          if (data.response.body.items !== "") {
            this.attrImage = data.response.body.items.item[0].galWebImageUrl;
          } else {
            this.attrImage = require("@/assets/img/noimage.png");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    ////////////////////// 관광지 이미지 가져오기 end //////////////////////

    // 여행 계획 등록하기
    async registPlan() {
      // console.log("places: " + this.places);
      if (!confirm("등록 하시겠습니까?")) {
        return;
      }
      this.plan.userId = this.userInfo.userId;
      await this.planRegist([this.plan, this.places]);
      if (this.isRegist) {
        // console.log("regist plan :: " + this.isRegist);
        this.$router.push({ name: "planlist" });
      }
    },
    ///////////////////// 관광지 리스트 드래그 start /////////////////////
    changePlaceList() {
      console.log("change::");

      this.deleteLine();

      this.drawingFlag = false;

      this.places.forEach((place) => {
        this.drawLine(place, true);
      });
    },
    ///////////////////// 관광지 리스트 드래그 end /////////////////////
  },
};
</script>

<style lang="scss">
.map-area {
  display: flex;
  position: relative;
  margin-top: 13px;
  .searchbox {
    position: absolute;
    top: 0;
    left: 0;
    height: 600px;
    z-index: 10000;
    background-color: #ffffffaa;
    width: 300px;
    display: flex;
    flex-direction: column;
    .results {
      flex: 1 1 auto;
      overflow-y: auto;
      .place {
        padding: 8px;
        cursor: pointer;

        &:hover {
          background-color: aliceblue;
        }
        h4 {
          margin: 0;
        }
      }
    }
  }
}

.add-custom {
  z-index: 10000;
}

#map {
  height: 600px;
}
</style>

<style>
.btn-custom {
  width: 20px;
  height: 20px;
}
.button {
  display: block;
  width: 100px;
  padding: 0;
  margin: 10px 20px 10px 0;
  font-weight: 600;
  text-align: center;
  line-height: 50px;
  color: #fff;
  border-radius: 5px;
  transition: all 0.2s;
}

.btnFloat {
  background: none;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.5);
}

.btnFloat:before {
  content: "저장";
  display: block;
  top: 0;
  left: 0;
  width: 100px;
  height: 50px;
  border-radius: 5px;
  transition: all 0.2s;
}

.btnBlueGreen.btnFloat:before {
  background: #5490fe;
}

.btnFloat:before {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.4);
}

.btnFloat:hover:before {
  margin-top: -2px;
  margin-left: 0px;
  transform: scale(1.1, 1.1);
  -ms-transform: scale(1.1, 1.1);
  -webkit-transform: scale(1.1, 1.1);
  box-shadow: 0px 5px 5px -2px rgba(0, 0, 0, 0.25);
}
h1.fourth {
  font-weight: 700;
}

h1.fourth span {
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
  border-bottom: 2px solid whitesmoke;
}

h1.fourth span:first-child {
  font-weight: 300;
}

.plan-content {
  cursor: pointer;
}
</style>
