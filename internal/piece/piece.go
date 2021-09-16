package piece

type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}
type Matrix struct {
	A int `json:"a"`
	B int `json:"b"`
	C int `json:"c"`
	D int `json:"d"`
}
type Piece struct {
	Matrix   Matrix  `json:"matrix"`
	Location Point   `json:"location"`
	Shape    []Point `json:"shape"`
}
type Solution struct {
	Day    int     `json:"day"`
	Month  string  `json:"month"`
	Pieces []Piece `json:"pieces"`
}

func New() *Piece {
	return &Piece{}
}

func (p *Piece) SetLocation(x, y int) *Piece {
	p.Location = Point{x, y}
	return p
}

func (p *Piece) SetShape(x ...int) *Piece {
	p.Shape = make([]Point, len(x)/2)
	for i := 0; i < len(x); i += 2 {
		p.Shape = append(p.Shape, Point{x[i], x[i+1]})
	}
	return p
}

func (p *Piece) SetMatrix(a, b, c, d int) *Piece {
	p.Matrix = Matrix{a, b, c, d}
	return p
}

func (p *Piece) GetPiece() Piece {
	return *p
}
