import { Breadcrumb } from 'react-bootstrap';

function NavBar(props: { state: string[], onBreadcrumbClick: (index: number) => void }) {
    return (
        <Breadcrumb>
            {props.state.map((item, index) => (
                <Breadcrumb.Item key={index} active={index === props.state.length - 1} onClick={() => props.onBreadcrumbClick(index)}>
                    {item}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
}

export default NavBar;
