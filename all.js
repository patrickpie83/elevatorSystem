const buildingPeople = document.querySelector(".buildingPeople");
const peopleRecord = document.querySelector(".peopleRecord");
const buildingStatus = document.querySelector(".buildingStatus");
const counterTime = document.querySelector(".counterTime");

let peopleRecordStr = "";
let buildingStatusStr = "";

let speed = 100 ; //演進速度(毫秒)
let people =[];
function createRequest(number) {
    //產生1~10的亂數
    let appearFloor = Math.floor(Math.random()*10)+1;
    let moveTarget;
    
    do {
        moveTarget = Math.floor(Math.random()*10)+1;
      }while ( moveTarget === appearFloor ) //防止移動目標樓層與出現樓層是相同的亂數
    let moveDirection = moveTarget > appearFloor ? "up" : "down";

    const request = {
        "id":number,
        appearFloor, //需求出現樓層
        moveTarget, //移動目標樓層
        moveDirection,//按鈕方向
        "chooseElevator":""
    };
    people.push(request);

    let str = `【${request.id}號，在${request.appearFloor}樓按了${moveDirection}想去${request.moveTarget}樓】`;
    console.log(str);
    peopleRecordStr +=`<p>${str}</p>`;
    peopleRecord.innerHTML = `<p>【出現人物紀錄】</p>${peopleRecordStr}`;
    
}

//計數器
let counter = 0;
let doneProcess = false;
function countTime(param){ 
    return new Promise ( (resolve,reject)=>{
        setTimeout( function(){
            resolve(param) 
        },speed);
    } );
}

(async function(){
    for(let i=1; doneProcess==false ;i++){
        counter = await countTime(i);
        let str = `【第${counter}秒】`;
        console.log(str);
        buildingStatusStr+=`<p>${str}</p>`;
    }
})();


//每秒產生需求
function getResolve(number){ 
    return new Promise ( (resolve,reject)=>{
        setTimeout( function(){
            createRequest(number),
            resolve(number) 
        },speed);
    } );
}

(async function(){
    for(let number=1;number<=40;number++){
        const res = await getResolve(number);
    }
})();

//初始設定
const elevators = {
    "elevatorA":{
        "name":"elevatorA",
        "liftDirection":"up",//因預設樓層在1樓，故預設升降方向為往上
        "stopFloor":0,//接著停留的樓層
        "presentFloor":1,//當前所在樓層
        "passengers":[],
        "releaseProcess":false
    },
    "elevatorB":{
        "name":"elevatorB",
        "liftDirection":"up",//因預設樓層在1樓，故預設升降方向為往上
        "stopFloor":0,//接著停留的樓層
        "presentFloor":1,//當前所在樓層
        "passengers":[],
        "releaseProcess":false
    }
}

//流程演進
function keepProcess(param){ 
    return new Promise ( (resolve,reject)=>{
        setTimeout( function(){
            resolve(param) 
        },speed);
    } );
}

//移動至下一層
function moveNextFloor(elevator){
    if(elevator.liftDirection=="up"){
        elevator.presentFloor++;
        
    }else if(elevator.liftDirection=="down"){
        elevator.presentFloor--;
    }
    
}

//載人
function carryingPeople(elevator){
    let enterPeopleTemp = []; //用來記錄誰進入電梯，以便篩除
    people.forEach( (person)=>{
        if( (person.appearFloor == elevator.presentFloor) && (person.moveDirection == elevator.liftDirection) ){ //此層＆同方向的人進入
            if(elevator.passengers.length < 5){
                elevator.passengers.push(person);
                enterPeopleTemp.push(person);
                let str = `${person.id}號進入了${elevator.name}電梯`;
                console.log(str)
                buildingStatusStr+=`<p>${str}</p>`;
            }
        }
    })
    enterPeopleTemp.forEach(person=>{
        //people陣列篩掉此人
        people = people.filter( item =>{
            return item != person;
        })
    })
}

/////////////////非停留層的情況//////////////////////
function getPassengetNeedOut(elevator){
    let passengerNeedOut = false;
    elevator.passengers.forEach(person=>{
        if(person.moveTarget == elevator.presentFloor){
            passengerNeedOut = passengerNeedOut || true;
        }
    })
    return passengerNeedOut
}

/////////////////到達停留層的情況//////////////////////
// 回傳是否有處理放人、同時若有乘客，需將乘客目標為當前層的人剔除
function releasePeople(elevator){
    let someoneLeft = false ; //若有人離開才是true

    if(elevator.passengers.length > 0){
        //記錄用
        elevator.passengers.forEach(person=>{
            if(person.moveTarget == elevator.presentFloor){
                someoneLeft = someoneLeft || true ;
                let str = `${person.id}號離開了${elevator.name}電梯`;
                console.log(str)
                buildingStatusStr+=`<p>${str}</p>`;
            }
        })
        //電梯內將會剩下 目標不在此層 的乘客
        elevator.passengers = elevator.passengers.filter( item =>{
            return item.moveTarget != elevator.presentFloor;
        })
    }
    
    return someoneLeft;
}
//回傳乘客的目標距離現在位置最近者
function getPassengerClosestTarget(elevator){
    let closestDistance = 100; //先預設一個極大值
    let closestTarget;
    elevator.passengers.forEach(person=>{
        if( Math.abs( person.moveTarget - elevator.presentFloor) < closestDistance ){
            closestDistance = Math.abs( person.moveTarget - elevator.presentFloor);
            closestTarget = person.moveTarget;
        }
    })
    return closestTarget;
}
//回傳此層是否還有需接收的人，且需在該層＆往同方向
function getPresentFloorSameDirectionPeople(presentFloor,presentDirection){
    let presentFloorSameDirectionPeople = false;
    people.forEach(person=>{
        if( (person.appearFloor == presentFloor) && (person.moveDirection == presentDirection) ){
            presentFloorSameDirectionPeople = presentFloorSameDirectionPeople || true ;
        }
    })
    return presentFloorSameDirectionPeople;
}

////////////////空車要載客的情況//////////////////////////
//回傳此層是否還有需求
function getPresentFloorPeople(value){
    
    let havePresentFloorPeople = false;
    people.forEach(person=>{
        if(person.appearFloor == value){
            havePresentFloorPeople = havePresentFloorPeople || true ;
        }
    });
    return havePresentFloorPeople;
}
//回傳此層id最小的人的目標樓層
function getThisFloorFirstIdMoveTarget(value){
    let firstId = 400; //先假定一個極大值，要再比較
    let firstIdMoveTarget;
    people.forEach(person=>{
        if(person.appearFloor == value){
            if(person.id<firstId){
                firstId = person.id;
                firstIdMoveTarget = person.moveTarget;
            }
        }
    })
    return firstIdMoveTarget;
}
//回傳此層id最小的人的移動方向
function getThisFloorFirstIdMoveDirection(value){
    let firstId = 400; //先假定一個極大值，要再比較
    let firstIdMoveDirection;
    people.forEach(person=>{
        if(person.appearFloor == value){
            if(person.id<firstId){
                firstId = person.id;
                firstIdMoveDirection = person.moveDirection;
            }
        }
    })
    return firstIdMoveDirection;
}
//回傳反方向（若需求還有B會往A的反方向找需求）
function getOppositeDirection(value){
    return value == "up" ? "down" : "up";
}
//回傳此層＆＆此方向是否有需求
function getThisFloorRequest(floor,direction){
    let thisFloorRequest = false;
    people.forEach(person=>{
        if( (person.appearFloor == floor) && (person.moveDirection == direction) ){
            thisFloorRequest = thisFloorRequest || true;
        }
    })
    return thisFloorRequest;
}
//回傳最大的出現樓層
function getTopAppearFloor(){
    let topAppearFloor = 0 ; //預設為極小值
    people.forEach(person=>{
        if(person.appearFloor > topAppearFloor){
            topAppearFloor = person.appearFloor ;
        }
    })
    return topAppearFloor
}
//回傳最小的出現樓層
function getLowAppearFloor(){
    let lowAppearFloor = 100 ; //預設為極大值
    people.forEach(person=>{
        if(person.appearFloor < lowAppearFloor){
            lowAppearFloor = person.appearFloor ;
        }
    })
    return lowAppearFloor
}
//傳入停留(目標)樓層、目前樓層，回傳應該移動的方向
function getHeadingDirection(target,begin){
    if((target - begin) > 0){
        return "up"
    }else{
        return "down"
    }
}
//回傳id最前面者的所在層
function getFirstIdAppearFloor(){
    let firstId = 400; //先假定一個極大值，要再比較
    let firstIdAppearFloor;
    people.forEach(person=>{
        if(person.id<firstId){
            firstId = person.id;
            firstIdAppearFloor = person.appearFloor;
        }
    })
    return firstIdAppearFloor;
}

(async function(){
    for(let i=1; doneProcess==false ;i++){
        counter = await keepProcess(i);
        //當大樓還有人或兩台電梯還有人時，繼續運作
        if( (people.length != 0) || (elevators.elevatorA.passengers.length > 0) || (elevators.elevatorB.passengers.length > 0) ){

            let elevatorAry = Object.values(elevators);
            elevatorAry.forEach(elevator=>{

                if( (elevator.stopFloor != 0) && (elevator.presentFloor != elevator.stopFloor)){
                    //【移動】
                    //該台電梯有設置停留層，但還沒到達停留層：該台繼續移動
                    //增加效率可在此增加：搭順風車的判斷

                    //此層非停留層，但乘客的目標為此層的，就順便放人
                    let passengerNeedOut = getPassengetNeedOut(elevator);
                    if(passengerNeedOut){
                        elevator.releaseProcess = releasePeople(elevator);

                        //如果放完人，而該電梯已無乘客，則stopFloor設為0
                        //如果該電梯內還有乘客，則stopFloor設為乘客目標樓層距離目前樓層最近的那個目標。
                        if(elevator.passengers.length == 0){
                            elevator.stopFloor = 0;
                        }else{
                            elevator.stopFloor = getPassengerClosestTarget(elevator);
                        }
                    }else{
                        //如果沒有要放人就繼續移動
                        moveNextFloor(elevator);
                    }

                }else if( (elevator.stopFloor != 0) && (elevator.presentFloor == elevator.stopFloor)){
                    //【空車載客、非空車載客/放人】
                    //該台電梯有設置停留層，且已到達停留層
                    
                    if(elevator.passengers.length == 0){
                        //若電梯中無乘客，則為空車載客，表示此層為需載客

                        //因可能有兩部同時到達情況，仍須先處理放人
                        elevator.releaseProcess = releasePeople(elevator);
                        
                        //若兩台電梯一起到達的情況，需分配
                        if(elevators.elevatorA.liftDirection == elevators.elevatorB.liftDirection && elevators.elevatorA.presentFloor == elevators.elevatorB.presentFloor && elevators.elevatorA.stopFloor == elevators.elevatorB.stopFloor){
                            //兩台電梯一起到達的情況，將乘客分配給A電梯
                            //並把A電梯的stopFloor設為最小id乘客的目標樓層，且移動方向設定與此乘客一樣
                            elevators.elevatorA.stopFloor = getThisFloorFirstIdMoveTarget(elevators.elevatorA.presentFloor);
                            elevators.elevatorA.liftDirection = getThisFloorFirstIdMoveDirection(elevators.elevatorA.presentFloor);
                            //接著A電梯載客。載在此層＆同方向的人。
                            carryingPeople(elevators.elevatorA);

                            //A電梯載客完之後，需再確認此層還有沒有需求
                            //若大樓已無人，表示都已被A電梯載完，B電梯stopFloor設為0
                            if(people.length == 0){
                                elevators.elevatorB.stopFloor = 0;
                            }else{
                                //如果大樓還有人，先確認此層是否有「剛剛A電梯的反方向」。若有則B電梯載這些人，stopFloor設id最小乘客的目標。並且移動
                                //先取得A電梯出發的反方向
                                let checkThisFloorOppositeDirection = getOppositeDirection(elevators.elevatorA.liftDirection);
                                //再取得此層是否有此反方向的需求
                                let checkThisFloorRequest = getThisFloorRequest(checkThisFloorOppositeDirection);
                                if(checkThisFloorRequest){
                                    //如果有此層有反方向的需求
                                    elevators.elevatorB.liftDirection = checkThisFloorOppositeDirection;
                                    elevators.elevatorB.stopFloor = getThisFloorFirstIdMoveTarget(elevators.elevatorB.presentFloor);
                                    carryingPeople(elevators.elevatorB);
                                }else{
                                    //如果此層無反方向的需求，則找大樓的需求
                                    //如果剛剛A電梯是往上，則找大樓最高的需求
                                    //如果剛剛A電梯是往下，則找大樓最低的需求
                                    if(elevators.elevatorA.liftDirection=="up"){
                                        elevators.elevatorB.stopFloor = getTopAppearFloor();
                                        elevators.elevatorB.liftDirection = getHeadingDirection(elevators.elevatorB.stopFloor,elevators.elevatorB.presentFloor);
                                    }else{
                                        elevators.elevatorB.stopFloor = getLowAppearFloor();
                                        elevators.elevatorB.liftDirection = getHeadingDirection(elevators.elevatorB.stopFloor,elevators.elevatorB.presentFloor);
                                    }
                                }
                            }
                        }else{
                            //如果只是一台電梯到達，該台載客
                            //先確認此層是否還有需求（有可能已被另一台載走）
                            //stopFloor設此層乘客id最小者的目標樓層，且方向設為此乘客的方向
                            let checkThisFloorRequest = getPresentFloorPeople(elevator.presentFloor);
                            if(checkThisFloorRequest){
                                elevator.stopFloor = getThisFloorFirstIdMoveTarget(elevator.presentFloor);
                                elevator.liftDirection = getThisFloorFirstIdMoveDirection(elevator.presentFloor);
                                carryingPeople(elevator);
                            }else{
                                elevator.stopFloor = 0;
                            }
                        }

                    }else{
                        //若電梯中是有乘客的，則為此層需要載客或放人

                        //先處理放人
                        elevator.releaseProcess = releasePeople(elevator);

                        //如果放完人，而該電梯已無乘客，則stopFloor設為0
                        //如果該電梯內還有乘客，則stopFloor設為乘客目標樓層距離目前樓層最近的那個目標。（有乘客時不可改變方向）
                        if(elevator.passengers.length == 0){
                            elevator.stopFloor = 0;
                        }else{
                            elevator.stopFloor = getPassengerClosestTarget(elevator);
                        }
                        
                        //再來處理載人
                        if(elevators.elevatorA.liftDirection == elevators.elevatorB.liftDirection && elevators.elevatorA.presentFloor == elevators.elevatorB.presentFloor && elevators.elevatorA.stopFloor == elevators.elevatorB.stopFloor){
                            //兩台電梯一起到達的情況，將乘客分配給A電梯
                            //並把A電梯的stopFloor設為乘客目標樓層距離目前樓層最近的那個目標
                            //需先載人，再進行stopFloor設定
                            carryingPeople(elevators.elevatorA);
                            elevators.elevatorA.stopFloor = getPassengerClosestTarget(elevators.elevatorA);
                            
                            //需再確認此層是否還有需求。此需求須為在該層＆往同方向的
                            //如果「此層」還有需要被載的，那B電梯需先接收、再設定stopFloor為乘客目標樓層距離目前樓層最近的那層
                            //如果「此層」已經沒有需要被載的，那B電梯就不用接收，但B電梯若已有放人，則不前進。 沒處理放人才可以前進
                            let presentFloorSameDirectionPeople = getPresentFloorSameDirectionPeople(elevator.presentFloor,elevator.liftDirection); 

                            if(presentFloorSameDirectionPeople){
                                //如果「此層」還有需要被載的

                                carryingPeople(elevators.elevatorB);
                                elevators.elevatorB.stopFloor = getPassengerClosestTarget(elevators.elevatorB);

                            }else{
                                //如果「此層」已經沒有需要被載的，而B電梯沒處理放人，可以前進

                                if(!elevators.elevatorB.releaseProcess){
                                    moveNextFloor(elevators.elevatorB);
                                }
                            }
                        }else{
                            //只有一台電梯到達，該台電題載客
                            //並把stopFloor設為乘客目標樓層距離目前樓層最近的那層

                            //載客，但不一定會有人進來
                            carryingPeople(elevator);

                            //設定stopFloor
                            //電梯內如果沒有乘客，stopFloor設為0
                            if(elevator.passengers.length == 0){
                                elevator.stopFloor = 0;
                            }else{
                                //若電梯內有乘客，stopFloor設為乘客目標樓層距離目前樓層最近的那層
                                elevator.stopFloor = getPassengerClosestTarget(elevator);
                            }
                        }
                        
                        //結束放人載人判斷，releaseProcess重置
                        elevator.releaseProcess = false;
                    }

                }else if( (elevator.stopFloor == 0) && (people.length > 0) ){
                    //【空車取得需求】
                    //該台電梯無停留層（即為0），而大樓仍有需求，則該台電梯需重新設定停留層
            
                    //若剩下的需求有在此層，即可直接載客
                    let thisFloor = elevator.presentFloor;
                    let presentFloorPeople = getPresentFloorPeople(thisFloor); 
                    if(presentFloorPeople){
                        if(elevators.elevatorA.liftDirection == elevators.elevatorB.liftDirection && elevators.elevatorA.presentFloor == elevators.elevatorB.presentFloor && elevators.elevatorA.stopFloor == elevators.elevatorB.stopFloor){
                            //兩台電梯都在此層的情況，將乘客分配給A電梯
                            //A電梯的stopFloor設此層乘客id最小者的目標樓層，且方向設與此乘客相同
                            elevators.elevatorA.stopFloor = getThisFloorFirstIdMoveTarget(elevators.elevatorA.presentFloor);
                            elevators.elevatorA.liftDirection = getThisFloorFirstIdMoveDirection(elevators.elevatorA.presentFloor);

                            //接著A電梯載客
                            carryingPeople(elevators.elevatorA);

                            //A電梯載客完之後，需再確認此層還有沒有需求
                            //若大樓已無人，表示都已被A電梯載完，B電梯stopFloor設為0
                            if(people.length == 0){
                                elevators.elevatorB.stopFloor = 0;
                            }else{
                                //如果大樓還有人，先確認此層是否有「剛剛A電梯的反方向」。若有則B電梯載這些人，stopFloor設id最小乘客的目標。並且移動
                                //先取得A電梯出發的反方向
                                let checkThisFloorOppositeDirection = getOppositeDirection(elevators.elevatorA.liftDirection);
                                //再取得此層是否有此反方向的需求
                                let checkThisFloorRequest = getThisFloorRequest(thisFloor,checkThisFloorOppositeDirection);
                                if(checkThisFloorRequest){
                                    //如果有此層有反方向的需求
                                    elevators.elevatorB.liftDirection = checkThisFloorOppositeDirection;
                                    elevators.elevatorB.stopFloor = getThisFloorFirstIdMoveTarget(elevators.elevatorB.presentFloor);
                                    carryingPeople(elevators.elevatorB);
                                }else{
                                    //如果此層無反方向的需求，則找大樓的需求
                                    //如果剛剛A電梯是往上，則找大樓最高的需求
                                    //如果剛剛A電梯是往下，則找大樓最低的需求
                                    if(elevators.elevatorA.liftDirection=="up"){
                                        elevators.elevatorB.stopFloor = getTopAppearFloor();
                                        //傳入停留樓層、目前樓層，計算方向
                                        elevators.elevatorB.liftDirection = getHeadingDirection(elevators.elevatorB.stopFloor,elevators.elevatorB.presentFloor);
                                    }else{
                                        elevators.elevatorB.stopFloor = getLowAppearFloor();
                                        //傳入停留樓層、目前樓層，計算方向
                                        elevators.elevatorB.liftDirection = getHeadingDirection(elevators.elevatorB.stopFloor,elevators.elevatorB.presentFloor);
                                    }
                                }
                            }
                        }else{
                            //如果只是一台電梯到達，該台載客
                            //且需求是在此層，該電梯stopFloor設此層乘客id最小者的目標樓層，且方向與此乘客相同
                            elevator.stopFloor = getThisFloorFirstIdMoveTarget(elevator.presentFloor);
                            elevator.liftDirection = getThisFloorFirstIdMoveDirection(elevator.presentFloor);

                            carryingPeople(elevator);
                        }
                    }else{
                        //如果需求不在此層，則該電梯stopFloor設大樓中id最小者的所在樓層，並設置要移動過去的方向
                        //需先設方向再移動
                        
                        elevator.stopFloor = getFirstIdAppearFloor();
                        elevator.liftDirection = getHeadingDirection(elevator.stopFloor,elevator.presentFloor);
                    }
                }
                
                if( (elevators.elevatorA.passengers.length == 0) && (elevators.elevatorB.passengers.length == 0) && (people.length == 0) ){
                    //當兩台都沒事了，也沒有需求的人，則結束流程
                    doneProcess = true;
                    console.log('流程結束')
                    console.log(`【共耗時${counter}秒】`)
                    buildingStatusStr+=`<p>流程結束</p><p>【共耗時${counter}秒】</p>`;
                    
                }
            })
        }

        //console.log

        let buildingPeopleStr = "";
        if(people.length == 0){
            buildingPeopleStr = "無";
        }else{
            people.forEach(person=>{
                buildingPeopleStr+=`<p>${person.id}號，在${person.appearFloor}樓按了${person.moveDirection}想去${person.moveTarget}樓</p>`;
            })
        }
        
        buildingPeople.innerHTML =`
            <p>目前大樓在等待的人為：</p> ${buildingPeopleStr}
        `
       
        let passengersStrA = "";
        elevators.elevatorA.passengers.forEach(person=>{
            passengersStrA+=`${person.id}號要去${person.moveTarget}樓。`;
        })
        let strA=`這一秒${elevators.elevatorA.name}在${elevators.elevatorA.presentFloor}樓，方向為${elevators.elevatorA.liftDirection}，接下來的停留層為${elevators.elevatorA.stopFloor}。乘客有：${passengersStrA}`;
        console.log(strA)

        let passengersStrB = "";
        elevators.elevatorB.passengers.forEach(person=>{
            passengersStrB+=`${person.id}號要去${person.moveTarget}樓。`;
        })
        let strB=`這一秒${elevators.elevatorB.name}在${elevators.elevatorB.presentFloor}樓，方向為${elevators.elevatorB.liftDirection}，接下來的停留層為${elevators.elevatorB.stopFloor}。乘客有：${passengersStrB}`
        console.log(strB)

        buildingStatusStr+=`<p>${strA}</p><p>${strB}</p>`;
        buildingStatus.innerHTML = `<p>【即時狀況】</p>${buildingStatusStr}`;

        counterTime.innerHTML = `耗時：${counter}秒`
    }
})();

console.log("【第0秒】")
buildingStatusStr+=`<p>【第0秒】</p>`;