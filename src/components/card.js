import React from 'react';
import '../styles/card.css';

function Card ({ name, role, image, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, onEdit }) {
    const pandaImg = require('../resources/PandaEducation.png');
    const handleAvatarClick = () => {
        console.log('Avatar placeholder clickeado para', name);
    };
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [isEditingRole, setIsEditingRole] = React.useState(false);
    const [editName, setEditName] = React.useState(name);
    const [editRole, setEditRole] = React.useState(role);

    const handleNameBlur = () => {
        setIsEditingName(false);
        if (onEdit) onEdit({ name: editName, role });
    };
    const handleRoleBlur = () => {
        setIsEditingRole(false);
        if (onEdit) onEdit({ name, role: editRole });
    };

    React.useEffect(() => { setEditName(name); }, [name]);
    React.useEffect(() => { setEditRole(role); }, [role]);

    return(
        <div
            className='cardContainer'
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ cursor: 'move', position: 'relative' }}
        >
            <div className='cardImage'>
                <div className='cardAvatar cardAvatarPlaceholder' onClick={handleAvatarClick} style={{cursor: 'pointer'}}>
                  <img src={image || pandaImg} alt={name} style={{ width: 84, height: 84, borderRadius: '50%' }} />
                </div>
            </div>
            <div className='cardRole'>
                {isEditingRole ? (
                  <input
                    className='cardTitleInput'
                    value={editRole}
                    autoFocus
                    onChange={e => setEditRole(e.target.value)}
                    onBlur={handleRoleBlur}
                    onKeyDown={e => e.key === 'Enter' && handleRoleBlur()}
                  />
                ) : (
                  <h3
                    className='cardTitle'
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    onClick={() => setIsEditingRole(true)}
                    style={{ cursor: 'text' }}
                  >
                    {role}
                  </h3>
                )}
                {isEditingName ? (
                  <input
                    className='cardSubtitleInput'
                    value={editName}
                    autoFocus
                    onChange={e => setEditName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={e => e.key === 'Enter' && handleNameBlur()}
                  />
                ) : (
                  <p
                    className='cardSubtitle'
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                    onClick={() => setIsEditingName(true)}
                    style={{ cursor: 'text' }}
                  >
                    {name}
                  </p>
                )}
            </div>
        </div>
    );
}

export default Card;

