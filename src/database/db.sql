CREATE TABLE IF NOT EXISTS Tickets
(
    TicketNumber INT(100) NOT NULL,
    Status VARCHAR(100) NOT NULL,
    CreatedBy VARCHAR(100) NOT NULL,
    TicketText TEXT NOT NULL,
    HandledBy VARCHAR(100) NULL,
    OpenedOn VARCHAR(100) NOT NULL,
    HandledOn VARCHAR(100) NULL,
    ClosedOn VARCHAR(100) NULL,
    PRIMARY KEY (TicketNumber)
);

CREATE TABLE IF NOT EXISTS TicketsNotes
(
    TicketNumber INT(100) NOT NULL,
    Note TEXT NOT NULL,
    NotedBy VARCHAR(100) NOT NULL,
    NotedOn VARCHAR(100) NOT NULL,
    PRIMARY KEY (TicketNumber),
    FOREIGN KEY (TicketNumber) REFERENCES Tickets(TicketNumber)
);