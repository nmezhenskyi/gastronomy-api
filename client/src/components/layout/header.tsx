import { Container, Row, Col } from 'react-bootstrap'

export const Header = () => {
   return (
      <Container>
         <Row className="text-center">
            <Col>Navigation</Col>
            <Col>
               <h1>Gastronomy API</h1>
            </Col>
            <Col>Sign In / Sign Up</Col>
         </Row>
      </Container>
   )
}
