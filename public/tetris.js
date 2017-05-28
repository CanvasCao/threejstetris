onload = function () {

    GameParas = {};
    GameParas.score = 0;
    GameParas.height = 20;
    GameParas.width = 12;
    GameParas.perWidth = 15;
    GameParas.halfW = parseInt(GameParas.width / 2) - 1;
    // canvas.setAttribute('width', GameParas.width * GameParas.perWidth);
    // canvas.setAttribute('height', GameParas.height * GameParas.perWidth);

    //方块的颜色
    GameParas.ColorArr = ['#66CCCC', '#CCFF66', '#FF99CC', '#666699', '#FF9900', '#FF6666', '#0099CC'];

    //大方块的字典数据
    GameParas.OstDictionary = {
        //0 |  1 田  2 L  3 J  4S  5Z  6土
        0: [[0, 0], [0, 1], [0, 2], [0, 3]],
        1: [[0, 0], [0, 1], [1, 0], [1, 1]],
        2: [[0, 0], [0, 1], [0, 2], [1, 2]],
        3: [[1, 0], [1, 1], [1, 2], [0, 2]],
        4: [[0, 1], [1, 1], [1, 0], [2, 0]],
        5: [[0, 0], [1, 0], [1, 1], [2, 1]],
        6: [[1, 0], [0, 1], [1, 1], [2, 1]]
    }


    GameHelper = {};
    GameHelper.Clone = function (currentBlock) {
        var newOst = new OneSevenType(1);
        newOst.dir = currentBlock.dir;
        newOst.index = currentBlock.index;
        for (var i = 0; i < currentBlock.SmallBlocksArr.length; i++) {
            newOst.SmallBlocksArr[i].x = currentBlock.SmallBlocksArr[i].x;
            newOst.SmallBlocksArr[i].y = currentBlock.SmallBlocksArr[i].y;
        }
        return newOst;
    }
    GameHelper.IfTouching = function (currentBlock, key) {//key有下左右转
        var newOst = GameHelper.Clone(currentBlock);
        if (key == 40) {//左上右下
            newOst.DownOne();
        }
        else if (key == 37) {
            newOst.LeftOne();
        }
        else if (key == 39) {
            newOst.RightOne();
        }
        else if (key == 38) {
            newOst.RotateOne();
        }

        for (var i = 0; i < newOst.SmallBlocksArr.length; i++) {
            for (var j = 0; j < gameBoard.stoppedArr.length; j++) {
                if (newOst.SmallBlocksArr[i].x == gameBoard.stoppedArr[j].x && newOst.SmallBlocksArr[i].y == gameBoard.stoppedArr[j].y) {
                    return true;
                }
            }
            for (var j = 0; j < gameBoard.edgeArr.length; j++) {
                if (newOst.SmallBlocksArr[i].x == gameBoard.edgeArr[j].x && newOst.SmallBlocksArr[i].y == gameBoard.edgeArr[j].y) {
                    return true;
                }
            }

        }
        return false;
    }
    GameHelper.GetRanIndex = function () {
        return parseInt(Math.random() * GameParas.ColorArr.length);
    }
    GameHelper.GetFullLines = function () {
        var result = {};//key 代表 y值   value代表个数
        var retArr = [];
        for (var i = 0; i < gameBoard.stoppedArr.length; i++) {
            if (gameBoard.stoppedArr[i].y in result) {
                result[gameBoard.stoppedArr[i].y]++;
            }
            else {
                result[gameBoard.stoppedArr[i].y] = 1;
            }

        }
        for (var k in result) {
            if (result[k] == GameParas.width) {
                retArr.push(k);
            }
        }
        return retArr;
//            console.log(retArr);

    }

    GameHelper.Eraser = function () {
        var eraserArr = GameHelper.GetFullLines();
        if (eraserArr.length == 0) return;
        for (var i = 0; i < gameBoard.stoppedArr.length; i++) {
            //得到每一个块在本次操作应该下降的高度 如果-1 代表不应该下降 他应该被删除...
            var result = GameHelper.GetDownNum(eraserArr, gameBoard.stoppedArr[i].y);
            if (result < 0)//说明就是这一行
            {
                gameBoard.stoppedArr = _.without(gameBoard.stoppedArr, gameBoard.stoppedArr[i]);
                i--;
            }
            else {
                gameBoard.stoppedArr[i].y += result;
            }
        }
    }

    //得到每一个块在本次操作应该下降的高度 如果-1 代表不应该下降 他应该被删除...
    GameHelper.GetDownNum = function (eraserArr, y) {
        var sum = 0;
        for (var i = 0; i < eraserArr.length; i++) {
            if (y < eraserArr[i]) {
                sum++;
            }
            else if (y == eraserArr[i]) {
                return -1;
            }
        }
        return sum;
    }

    //按下键得到下降num
    GameHelper.GetDownDownNum = function () {
        var num = 0;
        var newOst = GameHelper.Clone(currentBlock);

        for (var i = 0; i <= GameParas.height; i++) {
            num++;
            newOst.DownOne();
            if (GameHelper.IfTouching(newOst, 40)) {
                return num;//2格碰了我得返回1格
            } else {
                continue;
            }
        }
    }


    //小方块
    function SmallBlocks(x, y, type) {
        this.x = x;
        this.y = y;
        this.color = GameParas.ColorArr[type];
    }

    //1/7方块
    function OneSevenType(i) {
        //0 |  1 田  2 L  3 J  4S  5Z  6土
        this.dir = '上';
        this.index = i;
        this.SmallBlocksArr = [];
        this.init();
    }

    OneSevenType.prototype = {
        init: function () {
            var that = this;
            [].forEach.call(GameParas.OstDictionary[that.index], function (e, i, arr) {
                var x = e[0], y = e[1];
                that.SmallBlocksArr.push(new SmallBlocks(x + GameParas.halfW, y + 0, that.index))
            });

        },
        DownOne: function () {
            for (var i = 0; i < 4; i++) {
                this.SmallBlocksArr[i].y++;
            }
        },
        LeftOne: function () {
            for (var i = 0; i < 4; i++) {
                this.SmallBlocksArr[i].x--;
            }
        },
        RightOne: function () {
            for (var i = 0; i < 4; i++) {
                this.SmallBlocksArr[i].x++;
            }
        },
        RotateOne: function () {
            if (this.index == 0) {
                if (this.dir == '上') {
                    this.SmallBlocksArr[0].x--;
                    this.SmallBlocksArr[0].y++;
                    this.SmallBlocksArr[2].x++;
                    this.SmallBlocksArr[2].y--;
                    this.SmallBlocksArr[3].x += 2;
                    this.SmallBlocksArr[3].y -= 2;
                    this.dir = '左';
                }
                else {
                    this.SmallBlocksArr[0].x++;
                    this.SmallBlocksArr[0].y--;
                    this.SmallBlocksArr[2].x--;
                    this.SmallBlocksArr[2].y++;
                    this.SmallBlocksArr[3].x -= 2;
                    this.SmallBlocksArr[3].y += 2;
                    this.dir = '上';
                }
            }
            else if (this.index == 1) {
                return;
            }
            else if (this.index == 2) {
                if (this.dir == '上') {
                    this.SmallBlocksArr[2].x++;
                    this.SmallBlocksArr[2].y -= 2;
                    this.SmallBlocksArr[3].x++;
                    this.SmallBlocksArr[3].y -= 2;
                    this.dir = '左';
                }
                else if (this.dir == '左') {
                    this.SmallBlocksArr[1].x++;
                    this.SmallBlocksArr[1].y--;
                    this.SmallBlocksArr[2].y++;
                    this.SmallBlocksArr[3].x--;
                    this.SmallBlocksArr[3].y += 2;
                    this.dir = '下';
                }
                else if (this.dir == '下') {
                    this.SmallBlocksArr[0].y++;
                    this.SmallBlocksArr[1].y++;
                    this.SmallBlocksArr[2].x++;
                    this.SmallBlocksArr[3].x++;
                    this.SmallBlocksArr[3].y -= 2;
                    this.dir = '右';
                }
                else if (this.dir == '右') {
                    this.SmallBlocksArr[0].y--;
                    this.SmallBlocksArr[1].x--;
                    this.SmallBlocksArr[2].x -= 2;
                    this.SmallBlocksArr[2].y++;
                    this.SmallBlocksArr[3].x--;
                    this.SmallBlocksArr[3].y += 2;
                    this.dir = '上';
                }
            }
            else if (this.index == 3) {
                if (this.dir == '上') {
                    this.SmallBlocksArr[0].x--;
                    this.SmallBlocksArr[1].x--;
                    this.SmallBlocksArr[2].y--;
                    this.SmallBlocksArr[3].x += 2;
                    this.SmallBlocksArr[3].y--;
                    this.dir = '左';
                }
                else if (this.dir == '左') {
                    this.SmallBlocksArr[2].x--;
                    this.SmallBlocksArr[2].y++;
                    this.SmallBlocksArr[3].x--;
                    this.SmallBlocksArr[3].y--;
                    this.dir = '下';
                }
                else if (this.dir == '下') {
                    this.SmallBlocksArr[1].x++;
                    this.SmallBlocksArr[1].y--;
                    this.SmallBlocksArr[2].x += 2;
                    this.SmallBlocksArr[2].y -= 2;
                    this.SmallBlocksArr[3].x++;
                    this.SmallBlocksArr[3].y++;
                    this.dir = '右'
                }
                else if (this.dir == '右') {
                    this.SmallBlocksArr[0].x++;
                    this.SmallBlocksArr[1].y++;
                    this.SmallBlocksArr[2].x--;
                    this.SmallBlocksArr[2].y += 2;
                    this.SmallBlocksArr[3].x -= 2;
                    this.SmallBlocksArr[3].y++;
                    this.dir = '上';
                }
            }
            else if (this.index == 4) {
                if (this.dir == '上') {
                    this.SmallBlocksArr[2].x--;
                    this.SmallBlocksArr[3].x--;
                    this.SmallBlocksArr[3].y += 2;
                    this.dir = '左';
                }
                else if (this.dir == '左') {
                    this.SmallBlocksArr[2].x++;
                    this.SmallBlocksArr[3].x++;
                    this.SmallBlocksArr[3].y -= 2;
                    this.dir = '上';
                }
            }
            else if (this.index == 5) {
                if (this.dir == '上') {
                    this.SmallBlocksArr[0].y++;
                    this.SmallBlocksArr[3].x -= 2;
                    this.SmallBlocksArr[3].y++;
                    this.dir = '左';
                }
                else if (this.dir == '左') {
                    this.SmallBlocksArr[0].y--;
                    this.SmallBlocksArr[3].x += 2;
                    this.SmallBlocksArr[3].y--;
                    this.dir = '上';
                }
            }
            else if (this.index == 6) {
                if (this.dir == '上') {
                    this.SmallBlocksArr[0].x--;
                    this.SmallBlocksArr[2].x--;
                    this.SmallBlocksArr[2].y++;
                    this.SmallBlocksArr[3].x--;
                    this.dir = '左';
                }
                else if (this.dir == '左') {
                    this.SmallBlocksArr[1].x++;
                    this.SmallBlocksArr[1].y--;
                    this.SmallBlocksArr[2].x += 2;
                    this.SmallBlocksArr[2].y -= 2;
                    this.dir = '下';
                }
                else if (this.dir == '下') {
                    this.SmallBlocksArr[0].y++;
                    this.SmallBlocksArr[2].x--;
                    this.SmallBlocksArr[2].y++;
                    this.SmallBlocksArr[3].y++;
                    this.dir = '右';
                }
                else if (this.dir == '右') {
                    this.SmallBlocksArr[0].x++;
                    this.SmallBlocksArr[0].y--;
                    this.SmallBlocksArr[1].x--;
                    this.SmallBlocksArr[1].y++;
                    this.SmallBlocksArr[3].x++;
                    this.SmallBlocksArr[3].y--;
                    this.dir = '上';
                }
            }
        },
        DownDown: function () {
            var downNum = GameHelper.GetDownDownNum()
            for (var i = 0; i < 4; i++) {
                this.SmallBlocksArr[i].y += downNum;
            }
        },


        Render: function () {
            var arr = this.SmallBlocksArr;
            // for (var i = 0; i < 4; i++) {
            //     ctx.fillStyle = arr[i].color;
            //     ctx.fillRect(arr[i].x * GameParas.perWidth, arr[i].y * GameParas.perWidth, GameParas.perWidth, GameParas.perWidth);
            // }
        },
    }

    var gameBoard = {
        edgeArr: [],
        stoppedArr: [],
        init: function () {
            for (var i = 0; i <= GameParas.height; i++) {
                this.edgeArr.push(new SmallBlocks(-1, i));
            }

            for (var i = 0; i <= GameParas.width - 1; i++) {
                this.edgeArr.push(new SmallBlocks(i, GameParas.height));
            }
            for (var i = 0; i <= GameParas.height; i++) {
                this.edgeArr.push(new SmallBlocks(GameParas.width, i));
            }

        },
        //碰到以后三件事 1、stoppedArr插入块 2新建块 刷新快数组  3消除
        ThingsAfterTouchingGround: function () {
            for (var i = 0; i < currentBlock.SmallBlocksArr.length; i++) {
                this.stoppedArr.push(currentBlock.SmallBlocksArr[i]);
            }


            GameHelper.Eraser();

            currentBlock = new OneSevenType(GameHelper.GetRanIndex());
        },
        Render: function () {
            for (var i = 0; i < this.stoppedArr.length; i++) {
                // ctx.fillStyle = this.stoppedArr[i].color;
                // ctx.fillRect(this.stoppedArr[i].x * GameParas.perWidth, this.stoppedArr[i].y * GameParas.perWidth, GameParas.perWidth, GameParas.perWidth);
            }
        }
    }
    gameBoard.init();


    function Game() {

    }

    Game.prototype = {
        mainLoop: function () {
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            currentBlock.Render();
            gameBoard.Render();
        },
        //500毫秒判断一次是否碰到地面 没有就往下掉一次
        secLoop: function () {
            if (!GameHelper.IfTouching(currentBlock, 40)) {
                currentBlock.DownOne();
            }
            else { //碰到了就ThingsAfterTouchingGround
                gameBoard.ThingsAfterTouchingGround();

            }
        },
        run: function () {
            var that = this;
            setInterval(that.mainLoop, 30);
            setInterval(that.secLoop, 500);
        },
    }


    window.onkeydown = function (e) {
        var e = e || event;
        var c = e.keyCode;
        if (c == 37 || c == 38 || c == 39 || c == 40) {
            e.preventDefault();
            if (c == 37 && !GameHelper.IfTouching(currentBlock, 37)) {
                currentBlock.LeftOne();
            }
            else if (c == 39 && !GameHelper.IfTouching(currentBlock, 39)) {
                currentBlock.RightOne();
            }
            else if (c == 38 && !GameHelper.IfTouching(currentBlock, 38)) {
                currentBlock.RotateOne();
            }
            else if (c == 40 && !GameHelper.IfTouching(currentBlock, 40)) {
                currentBlock.DownDown();
                gameBoard.ThingsAfterTouchingGround();
            }
        }


    }

    var game = new Game();
    var currentBlock = new OneSevenType(GameHelper.GetRanIndex());
    game.run();

}