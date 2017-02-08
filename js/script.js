(function() {

    //event.srcElement;

    var SVG_NS = "http://www.w3.org/2000/svg",
        XLINK_NS = "http://www.w3.org/1999/xlink",
        Contanier = document.getElementById('canvas'),
        SvgRoot = document.createElementNS(SVG_NS, 'svg');

    var CELL_NUM = 19;
    var EDGE = Contanier.clientWidth / (CELL_NUM + 1); //30
    var MARGIN = EDGE / 2; //15
    var RADIU = EDGE / 3; //10

    var CrossPointInBoard = [];

    var DragTarget = null;
    var TrueCoords = null;
    var GrabPoint = null;

    var VirtualChess = null;

    var BlackChess = true;
    var IfDrag = false;
    var ChessStore = [];


    window.onload = function() {

        init();
        initCrossPointInBoard();
    }

    function init() {

        SvgRoot.setAttribute('width', '100%');
        SvgRoot.setAttribute('height', '100%');
        Contanier.appendChild(SvgRoot);

        TrueCoords = SvgRoot.createSVGPoint();
        GrabPoint = SvgRoot.createSVGPoint();

        var gradient = document.getElementById('gradient').innerHTML;
        SvgRoot.innerHTML = gradient;

        SvgRoot.appendChild(renderChessboard());

        SvgRoot.onclick = boardClick;
        SvgRoot.oncontextmenu = function(){
            return false;
        };

        SvgRoot.onmousedown = chessMousedown;
        SvgRoot.onmousemove = chessMousemove;
        SvgRoot.onmouseup = chessMouseup;

    }

    function initCrossPointInBoard() {

        for (var i = 0; i <= CELL_NUM; i++) {
            CrossPointInBoard[i] = [];
            for (var j = 0; j <= CELL_NUM; j++) {
                CrossPointInBoard[i][j] = 0; //没有落子
            }
        }
    }

    function renderChessboard() {
        var docFrag = document.createDocumentFragment();

        for (var i = 0; i <= CELL_NUM; i++) {

            var lineVartical = docFrag.appendChild(drawLine(MARGIN + i * EDGE, MARGIN, MARGIN + i * EDGE, Contanier.clientWidth - MARGIN));
            var lineHorizontal = docFrag.appendChild(drawLine(MARGIN, MARGIN + i * EDGE, Contanier.clientWidth - MARGIN, MARGIN + i * EDGE));

            docFrag.appendChild(lineVartical);
            docFrag.appendChild(lineHorizontal);

        }

        return docFrag;
    }

    function drawLine(x1, y1, x2, y2) {

        var line = document.createElementNS(SVG_NS, 'line');

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        line.setAttribute('stroke', '#DEB887');

        return line

    }

    function boardClick(evt) {

        if(IfDrag) return;

        var _i_j = getRowColNum(evt.offsetX, evt.offsetY);
        var chessPosition = getChessPosition(_i_j.i, _i_j.j);


        if(CrossPointInBoard[_i_j.i][_i_j.j] == 0) {

            var chess = createChesspiece(_i_j.i, _i_j.j, chessPosition.cx, chessPosition.cy, BlackChess)

            if(ChessStore[ChessStore.length-1]){
                ChessStore[ChessStore.length-1].oneDragChance = false;
                ChessStore[ChessStore.length-1].setAttribute('r', RADIU);
            }

            ChessStore.push(chess);
            SvgRoot.appendChild(chess);

            if(BlackChess) {
                CrossPointInBoard[_i_j.i][_i_j.j] = 1;//填充1表示该交叉点落黑子
            } else {
                CrossPointInBoard[_i_j.i][_i_j.j] = 2;//填充2表示该交叉点落百子
            }

        }

        BlackChess = !BlackChess; //交替黑白落子

        //计算可以杀死的子
        var deads = kill(_i_j);
        if(deads) {
            for(var i=0; i <deads.length; i++){
                ChessRemove.call(deads[i]);
            }
        }
    }

    function kill(_i_j) {
        var deads = [];
        var k = 0;

        while (true) {

            for(var i = -1; i <= 1; i++) for(var j = -1; j <= 1; j++) if(!i^!j) {
                if(CrossPointInBoard[_i_j.i+ i][_i_j.j + j] &&
                    CrossPointInBoard[_i_j.i+ i][_i_j.j + j] != CrossPointInBoard[_i_j.i][_i_j.j]) {

                    deads.push([_i_j.i+ i, _i_j.j + j]);

                }
            }

            if ( k >= ChessStore.length) break;
            k++;
        }
        return deads;
    }

    function ChessRemove() {
        var i_j = this;
        var _i = i_j[0],
            _j = i_j[1];
        for (var i = 0; i< ChessStore.length; i++ ){
            if(ChessStore[i].i == _i && ChessStore[i].j == _j){
                SvgRoot.removeChild(ChessStore[i]);
                ChessStore.pop(ChessStore[i]);
                CrossPointInBoard[_i][_j] = 0;
            }
        }

    }

    function getRowColNum(offsetx, offsety) {


        var _i = Math.floor(offsetx / EDGE),
            _j = Math.floor(offsety / EDGE);

        return {
            'i': _i,
            'j': _j
        };
    }

    function getChessPosition(i, j) {

        var cx = MARGIN + i * EDGE,
            cy = MARGIN + j * EDGE;

        return {'cx': cx, 'cy': cy}

    }

    function createChesspiece(i, j, cx, cy, me) {

        var circle = document.createElementNS(SVG_NS, 'circle');

        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', RADIU + 2);

        if (me) {

            circle.setAttribute('fill', 'url("#blackChessGradient")');
            circle.color = 1;

        } else {

            circle.setAttribute('fill', 'url("#whiteChessGradient")');
            circle.color = 2;

        }

        circle.oneDragChance = true;
        circle.i = i;
        circle.j = j;

        circle.onclick = chessClick;
        circle.onmouseover = chessOver;

        return circle;
    };

    function chessClick(evt) {
        evt.stopPropagation();
    }

    function chessOver(evt) {
        evt.stopPropagation();
        if(evt.target.oneDragChance) {
            evt.target.style.cursor = 'move';
        } else {
            evt.target.style.cursor = 'not-allowed';
        }
    }


    function chessMousedown(evt) {
        evt.stopPropagation()

        IfDrag = false;

        if(evt.target.nodeName == 'circle' && evt.target.oneDragChance) {

            DragTarget = evt.target;

            DragTarget.parentNode.appendChild( DragTarget );
            var transMatrix = DragTarget.getCTM();

            GrabPoint.x = TrueCoords.x - Number(transMatrix.e);
            GrabPoint.y = TrueCoords.y - Number(transMatrix.f);

        }
    }

    function createVirtualChess(chessPosition) {

        VirtualChess = document.createElementNS(SVG_NS, 'circle');

        VirtualChess.setAttribute('cx', chessPosition.cx);
        VirtualChess.setAttribute('cy', chessPosition.cy);
        VirtualChess.setAttribute('r', RADIU);
        VirtualChess.setAttribute('fill', "#8B4513");

        VirtualChess.style.opacity = "0.4";

        SvgRoot.appendChild(VirtualChess);

    }

    function chessMousemove(evt) {

        GetTrueCoords(evt);
        var rect, offsetX, offsetY;

        if(DragTarget) {

            rect  = SvgRoot.getBoundingClientRect(),
            offsetX = evt.clientX - rect.left;
            offsetY = evt.clientY - rect.top;
        }


        var _i_j = getRowColNum(offsetX, offsetY);
        // var _i_j = getRowColNum(evt.offsetX, evt.offsetY);

        var chessPosition = getChessPosition(_i_j.i, _i_j.j);

        if (DragTarget && offsetX >= MARGIN && offsetX <= Contanier.clientWidth-MARGIN
            && offsetY >= MARGIN && offsetY <= Contanier.clientWidth-MARGIN)
        {
            IfDrag = true;

            if(!VirtualChess){

                createVirtualChess(chessPosition);

            } else {

                VirtualChess.setAttribute('cx', chessPosition.cx);
                VirtualChess.setAttribute('cy', chessPosition.cy);
            }

            var newX = TrueCoords.x - GrabPoint.x;
            var newY = TrueCoords.y - GrabPoint.y;

            DragTarget.setAttributeNS(null, 'transform', 'translate(' + newX + ',' + newY + ')');

        }
    }

    function chessMouseup(evt) {

        if ( DragTarget )
        {

            var targetElement = evt.target;
            var rect, offsetX, offsetY;


            DragTarget.setAttributeNS(null, 'pointer-events', 'all');

            if(DragTarget) {

                rect  = SvgRoot.getBoundingClientRect(),
                offsetX = evt.clientX - rect.left;
                offsetY = evt.clientY - rect.top;

            }
            var _i_j = getRowColNum(offsetX, offsetY);
            // var _i_j = getRowColNum(evt.offsetX, evt.offsetY);

            var chessPosition = getChessPosition(_i_j.i, _i_j.j);


            if(CrossPointInBoard[_i_j.i][_i_j.j] != 0){

                DragTarget.removeAttribute('transform');

            } else {


                DragTarget.setAttribute('cx', chessPosition.cx);
                DragTarget.setAttribute('cy', chessPosition.cy);
                DragTarget.removeAttribute('transform');

                CrossPointInBoard[_i_j.i][_i_j.j] = DragTarget.color;
                CrossPointInBoard[DragTarget.i][DragTarget.j] = 0;


                DragTarget.oneDragChance = false; //一次拖动棋子的机会已使用完
                DragTarget.setAttribute('r', RADIU); //拖动后的棋子半径恢复正常大小

            }

            SvgRoot.removeChild(VirtualChess);
            VirtualChess = null;
            DragTarget = null;
         }

    }

    function GetTrueCoords(evt)
    {
         var newScale = SvgRoot.currentScale;
         var translation = SvgRoot.currentTranslate;
         TrueCoords.x = (evt.clientX - translation.x)/newScale;
         TrueCoords.y = (evt.clientY - translation.y)/newScale;
    }



})();